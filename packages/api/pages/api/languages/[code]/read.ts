import * as z from 'zod';
import {
  GetLanguageVerseRangeResponseBody,
  GetLanguageVerseRangeRequestBody,
  ReadingVerse,
  ReadingChapter,
} from '@translation/api-types';
import { client } from '../../../../shared/db';
import createRoute from '../../../../shared/Route';

const PAGE_SIZE = 3;

export default createRoute<{ code: string }>()
  .get<GetLanguageVerseRangeRequestBody, GetLanguageVerseRangeResponseBody>({
    schema: z.object({
      start: z.string(),
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

      const start = req.body.start;
      const end =
        req.body.start.slice(0, 2) +
        (+req.body.start.slice(2, 5) + PAGE_SIZE + 1)
          .toString()
          .padStart(3, '0') +
        '001';

      const chapters = await client.$queryRaw<ReadingChapter[]>`
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
              AND ph."languageId" = '018bba77-bbea-1edf-c38a-d72521f05821'::uuid
          ) AS ph ON true
          LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id AND g.state = 'APPROVED'
          WHERE v.id >= ${start} AND v.id <= ${end}
          GROUP BY v.id
        ) AS verses
        GROUP BY "book", "chapter"
        ORDER BY "book", "chapter"
      `;

      const next = chapters[PAGE_SIZE];
      res.ok({
        data: chapters.slice(0, PAGE_SIZE),
        next: next
          ? `${next.book.toString().padStart(2, '0')}${next.chapter
              .toString()
              .padStart(3, '0')}001`
          : undefined,
      });
    },
  })
  .build();
