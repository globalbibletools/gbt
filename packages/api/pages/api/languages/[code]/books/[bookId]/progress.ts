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
        SELECT (COUNT(DISTINCT w.id) FILTER (WHERE ph."deletedAt" IS NULL AND g.state = 'APPROVED'))::integer AS "approvedCount", 
               (COUNT(DISTINCT w.id))::integer AS "wordCount"
          FROM "Word" AS w
          JOIN "Verse" AS v ON v.id = w."verseId" AND v."bookId" = ${parseInt(
            req.query.bookId
          )}
          LEFT JOIN "PhraseWord" AS phw ON phw."wordId" = w.id
          LEFT JOIN "Phrase" AS ph ON ph.id = phw."phraseId" AND ph."languageId" = ${
            language.id
          }::uuid
          LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id`
      )[0];

      return res.ok({ data: bookProgress });
    },
  })
  .build();
