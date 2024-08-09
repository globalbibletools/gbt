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

      const { wordsApproved } = (
        await client.$queryRaw<[{ wordsApproved: number }]>`
        SELECT COUNT(1)::integer AS "wordsApproved"
            FROM "Word" AS w
            JOIN "Verse" AS v ON v.id = w."verseId" AND v."bookId" = ${parseInt(
              req.query.bookId
            )}
            JOIN "PhraseWord" AS phw ON phw."wordId" = w.id
            LEFT JOIN "Phrase" AS ph ON ph.id = phw."phraseId" AND ph."languageId" = ${
              language.id
            }::uuid
            LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id
        WHERE ph."deletedAt" IS NULL AND g.state = 'APPROVED'
        `
      )[0];

      const { wordsTotal } = (
        await client.$queryRaw<[{ wordsTotal: number }]>`
        SELECT COUNT(1)::integer AS "wordsTotal"
            FROM "Word" AS w
            JOIN "Verse" AS v ON v.id = w."verseId" AND v."bookId" = ${parseInt(
              req.query.bookId
            )}
        `
      )[0];

      console.log(wordsApproved);
      console.log(wordsTotal);
      return res.ok({ wordsApproved, wordsTotal });
    },
  })
  .build();
