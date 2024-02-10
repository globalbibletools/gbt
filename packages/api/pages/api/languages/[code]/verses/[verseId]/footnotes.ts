import {
  GetVerseFootnotesResponseBody,
  Footnote,
} from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { client } from '../../../../../../shared/db';

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVerseFootnotesResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        return res.notFound();
      }

      const notes = await client.$queryRaw<Footnote[]>`
          SELECT
            "Word"."id" as "wordId",
            COALESCE("User"."name", '') AS "authorName",
            "Footnote"."timestamp",
            COALESCE("Footnote"."content", '') AS "content"
          FROM "Word"
          LEFT OUTER JOIN "Footnote" ON "Word"."id" = "Footnote"."wordId"
              AND "Footnote"."languageId" = ${language.id}::uuid
          LEFT OUTER JOIN "User" ON "Footnote"."authorId" = "User"."id"
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
