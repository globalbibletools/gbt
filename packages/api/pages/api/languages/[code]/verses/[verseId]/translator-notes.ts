import {
  GetVerseTranslatorNotesResponseBody,
  TranslatorNote,
} from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { client } from '../../../../../../shared/db';

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVerseTranslatorNotesResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        return res.notFound();
      }

      const notes = await client.$queryRaw<TranslatorNote[]>`
        SELECT
          "Word"."id" as "wordId",
          COALESCE("User"."name", '') AS "authorName",
          "TranslatorNote"."timestamp",
          COALESCE("TranslatorNote"."content", '') AS "content"
        FROM "Word"
        LEFT OUTER JOIN "TranslatorNote" ON "Word"."id" = "TranslatorNote"."wordId"
            AND "TranslatorNote"."languageId" = ${language.id}::uuid
        LEFT OUTER JOIN "User" ON "TranslatorNote"."authorId" = "User"."id"
        WHERE "Word"."verseId" = ${req.query.verseId}
        ORDER BY "wordId" ASC
      `;

      if (notes.length > 0) {
        return res.ok({
          data: Object.fromEntries(
            notes.map(({ wordId, authorName, timestamp, content }) => [
              wordId,
              { wordId, authorName, timestamp: +timestamp, content },
            ])
          ),
        });
      }
      res.notFound();
    },
  })
  .build();
