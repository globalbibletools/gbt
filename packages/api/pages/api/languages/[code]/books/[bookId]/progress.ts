import { GetBookProgressResponseBody } from '@translation/api-types';
import { client } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';

export default createRoute<{ code: string; bookId: string }>()
  .get<void, GetBookProgressResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: { code: req.query.code },
      });
      if (!language) {
        return res.notFound();
      }

      const bookProgress = (
        await client.$queryRaw<[{ approvedCount: number; wordCount: number }]>`
          SELECT
            COUNT(*) AS "wordCount",
            COUNT(*) FILTER (WHERE ph."wordId" IS NOT NULL) AS "approvedCount"
          FROM "Book" AS b
          JOIN "Verse" AS v ON v."bookId" = b.id
          JOIN "Word" AS w ON w."verseId" = v.id
          LEFT JOIN LATERAL (
            SELECT phw."wordId" FROM "PhraseWord" AS phw
            JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
            JOIN "Gloss" AS g ON g."phraseId" = ph.id
            WHERE ph."languageId" = ${language.id}::uuid
              AND ph."deletedAt" IS NULL
              AND g.state = 'APPROVED'
              AND phw."wordId" = w.id
          ) AS ph ON true
          WHERE v."bookId" = ${parseInt(req.query.bookId)}`
      )[0];

      return res.ok({
        data: {
          approvedCount: Number(bookProgress.approvedCount),
          wordCount: Number(bookProgress.wordCount),
        },
      });
    },
  })
  .build();
