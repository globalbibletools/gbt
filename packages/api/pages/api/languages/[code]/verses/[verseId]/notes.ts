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
        --- First we create a query with the words in a verse.
        WITH "VerseWord" AS (
          SELECT "Word"."id" FROM "Verse"
          JOIN "Word" ON "Verse"."id" = "Word"."verseId"
          WHERE "verseId" = ${req.query.verseId}
        ),
        --- Then we gather the note for each word in the verse.
        "WordNote" as (
          SELECT "VerseWord"."id", "TranslatorNote".* FROM "VerseWord"
          JOIN "Word" ON "Word"."id" = "VerseWord"."id"
          JOIN "TranslatorNote" ON "Word"."id" = "TranslatorNote"."wordId"
            AND "TranslatorNote"."languageId" = ${language.id}::uuid
        )
        --- Now we add in the author's name and combine it all together.
        SELECT
          "VerseWord"."id" as "wordId",
          COALESCE("User"."name", '') AS "authorName",
          "WordNote"."timestamp",
          COALESCE("WordNote"."content", '') AS "content"
        FROM "VerseWord"
        LEFT OUTER JOIN "WordNote" ON "VerseWord"."id" = "WordNote"."id"
        LEFT OUTER JOIN "User" ON "WordNote"."authorId" = "User"."id"
        ORDER BY "VerseWord"."id" ASC
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
