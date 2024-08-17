import * as z from 'zod';
import {
  GetLanguageVerseRangeResponseBody,
  GetLanguageVerseRangeRequestBody,
} from '@translation/api-types';
import { client } from '../../../../shared/db';
import createRoute from '../../../../shared/Route';

const PAGE_SIZE = 3;

export default createRoute<{ code: string }>()
  .get<GetLanguageVerseRangeRequestBody, GetLanguageVerseRangeResponseBody>({
    schema: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        res.notFound();
        return;
      }

      if (req.body.start) {
        res.ok(await startCursorQuery(req.body.start, language.id));
      } else if (req.body.end) {
        res.ok(await endCursorQuery(req.body.end, language.id));
      } else {
        res.invalid([{ code: 'Mising start or end cursor' }]);
      }
    },
  })
  .build();

async function startCursorQuery(
  start: string,
  languageId: string
): Promise<GetLanguageVerseRangeResponseBody> {
  const bookId = parseInt(start.slice(0, 2)) || 1;
  const chapterNumber = parseInt(start.slice(2, 5)) || 1;

  const data = await client.$queryRaw<GetLanguageVerseRangeResponseBody[]>`
        SELECT
          (
            SELECT CONCAT(LPAD(chapter."bookId"::text, 2, '0'),LPAD(chapter.chapter::text, 3, '0'),'001') FROM (SELECT DISTINCT v."bookId", v."chapter" FROM "Verse" AS v
            WHERE (v."bookId" = ${bookId} AND v.chapter >= ${chapterNumber}) OR v."bookId" > ${bookId}
            ORDER BY v."bookId", v."chapter"
            OFFSET 3 LIMIT 1) AS chapter
          ) AS next,
          (
            SELECT CONCAT(LPAD(chapter."bookId"::text, 2, '0'),LPAD(chapter.chapter::text, 3, '0'),'001') FROM (SELECT DISTINCT v."bookId", v."chapter" FROM "Verse" AS v
            WHERE (v."bookId" = ${bookId} AND v.chapter <= ${chapterNumber}) OR v."bookId" < ${bookId}
            ORDER BY v."bookId" DESC, v."chapter" DESC
            OFFSET 1 LIMIT 1) AS chapter
          ) AS prev,
          (
            SELECT json_agg(json_build_object(
              'book', chapter.book,
              'chapter', chapter.chapter,
              'verses', chapter.verses
            ))
            FROM (
              SELECT
                "book", "chapter",
                json_agg(json_build_object(
                  'id', "id",
                  'number', "number",
                  'words', "words"
                ) ORDER BY number) AS "verses"
              FROM (
                SELECT
                  v.id,
                  v.number, v.chapter, v."bookId" AS book,
                  json_agg(json_strip_nulls(json_build_object(
                    'id', w.id,
                    'text', w.text,
                    'gloss', g.gloss,
                    'linked_words', ph.linked_words
                  )) ORDER BY w.id) AS words
                FROM "Verse" AS v
                JOIN (
                  SELECT DISTINCT v."bookId", v."chapter" FROM "Verse" AS v
                  WHERE (v."bookId" = ${bookId} AND v.chapter >= ${chapterNumber}) OR v."bookId" > ${bookId}
                  ORDER BY v."bookId", v."chapter"
                  LIMIT ${PAGE_SIZE}
                ) AS chapter ON chapter."bookId" = v."bookId" AND chapter.chapter = v.chapter
                JOIN "Word" AS w ON w."verseId" = v.id
                LEFT JOIN LATERAL (
                  SELECT ph.id, wds.words AS linked_words FROM "PhraseWord" AS phw
                  JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
                  LEFT JOIN LATERAL (
                    SELECT array_agg(phw2."wordId") AS words FROM "PhraseWord" AS phw2
                    WHERE phw2."phraseId" = ph.id
                      AND phw2."wordId" != phw."wordId"
                    GROUP BY phw2."phraseId"
                  ) AS wds ON true
                  WHERE phw."wordId" = w.id
                    AND ph."deletedAt" IS NULL
                    AND ph."languageId" = ${languageId}::uuid
                ) AS ph ON true
                LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id AND g.state = 'APPROVED'
                GROUP BY v.id
              ) AS verses
              GROUP BY "book", "chapter"
              ORDER BY "book", "chapter"
              LIMIT ${PAGE_SIZE}
            ) AS chapter
          ) AS data
      `;

  return data[0];
}

async function endCursorQuery(
  end: string,
  languageId: string
): Promise<GetLanguageVerseRangeResponseBody> {
  const bookId = parseInt(end.slice(0, 2)) || 1;
  const chapterNumber = parseInt(end.slice(2, 5)) || 1;

  console.log(bookId, chapterNumber);

  const data = await client.$queryRaw<GetLanguageVerseRangeResponseBody[]>`
        SELECT
          (
            SELECT CONCAT(LPAD(chapter."bookId"::text, 2, '0'),LPAD(chapter.chapter::text, 3, '0'),'001') FROM (SELECT DISTINCT v."bookId", v."chapter" FROM "Verse" AS v
            WHERE (v."bookId" = ${bookId} AND v.chapter <= ${chapterNumber}) OR v."bookId" < ${bookId}
            ORDER BY v."bookId" DESC, v."chapter" DESC
            OFFSET 3 LIMIT 1) AS chapter
          ) AS prev,
          (
            SELECT CONCAT(LPAD(chapter."bookId"::text, 2, '0'),LPAD(chapter.chapter::text, 3, '0'),'001') FROM (SELECT DISTINCT v."bookId", v."chapter" FROM "Verse" AS v
            WHERE (v."bookId" = ${bookId} AND v.chapter >= ${chapterNumber}) OR v."bookId" > ${bookId}
            ORDER BY v."bookId", v."chapter"
            OFFSET 1 LIMIT 1) AS chapter
          ) AS next,
          (
            SELECT json_agg(json_build_object(
              'book', chapter.book,
              'chapter', chapter.chapter,
              'verses', chapter.verses
            ))
            FROM (
              SELECT
                "book", "chapter",
                json_agg(json_build_object(
                  'id', "id",
                  'number', "number",
                  'words', "words"
                ) ORDER BY number) AS "verses"
              FROM (
                SELECT
                  v.id,
                  v.number, v.chapter, v."bookId" AS book,
                  json_agg(json_strip_nulls(json_build_object(
                    'id', w.id,
                    'text', w.text,
                    'gloss', g.gloss,
                    'linked_words', ph.linked_words
                  )) ORDER BY w.id) AS words
                FROM "Verse" AS v
                JOIN (
                  SELECT DISTINCT v."bookId", v."chapter" FROM "Verse" AS v
                  WHERE (v."bookId" = ${bookId} AND v.chapter <= ${chapterNumber}) OR v."bookId" < ${bookId}
                  ORDER BY v."bookId" DESC, v."chapter" DESC
                  LIMIT ${PAGE_SIZE}
                ) AS chapter ON chapter."bookId" = v."bookId" AND chapter.chapter = v.chapter
                JOIN "Word" AS w ON w."verseId" = v.id
                LEFT JOIN LATERAL (
                  SELECT ph.id, wds.words AS linked_words FROM "PhraseWord" AS phw
                  JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
                  LEFT JOIN LATERAL (
                    SELECT array_agg(phw2."wordId") AS words FROM "PhraseWord" AS phw2
                    WHERE phw2."phraseId" = ph.id
                      AND phw2."wordId" != phw."wordId"
                    GROUP BY phw2."phraseId"
                  ) AS wds ON true
                  WHERE phw."wordId" = w.id
                    AND ph."deletedAt" IS NULL
                    AND ph."languageId" = ${languageId}::uuid
                ) AS ph ON true
                LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id AND g.state = 'APPROVED'
                GROUP BY v.id
              ) AS verses
              GROUP BY "book", "chapter"
              ORDER BY "book", "chapter"
              LIMIT ${PAGE_SIZE}
            ) AS chapter
          ) AS data
      `;

  return data[0];
}
