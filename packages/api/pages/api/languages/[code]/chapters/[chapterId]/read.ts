import {
  GetLanguageReadingChapterResponseBody,
  ReadingVerse,
} from '@translation/api-types';
import { client } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';

export default createRoute<{ code: string; chapterId: string }>()
  .get<void, GetLanguageReadingChapterResponseBody>({
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

      const bookId = parseInt(req.query.chapterId.slice(0, 2)) || 1;
      const chapterNumber = parseInt(req.query.chapterId.slice(2, 5)) || 1;

      const verses = await client.$queryRaw<ReadingVerse[]>`
        SELECT
          v.id,
          v.number,
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
            AND ph."languageId" = ${language.id}::uuid
        ) AS ph ON true
        LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id AND g.state = 'APPROVED'
        WHERE v."bookId" = ${bookId} AND v.chapter = ${chapterNumber}
        GROUP BY v.id
      `;

      res.ok({ data: { verses } });
    },
  })
  .build();