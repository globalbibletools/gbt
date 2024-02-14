import { GetVerseNotesResponseBody } from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { client } from '../../../../../../shared/db';

type NotesQueryResult = {
  wordId: string;
  translatorNoteAuthorName: string;
  footnoteAuthorName: string;
  translatorNoteTimestamp: number;
  footnoteTimestamp: number;
  translatorNoteContent: string;
  footnoteContent: string;
}[];

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVerseNotesResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        return res.notFound();
      }

      const notes = await client.$queryRaw<NotesQueryResult>`
          SELECT
            "Word"."id" as "wordId",
            COALESCE("TranslatorNoteUser"."name", '') AS "translatorNoteAuthorName",
            COALESCE("FootnoteUser"."name", '') AS "footnoteAuthorName",
            "TranslatorNote"."timestamp" AS "translatorNoteTimestamp",
            "Footnote"."timestamp" AS "footnoteTimestamp",
            COALESCE("TranslatorNote"."content", '') AS "translatorNoteContent",
            COALESCE("Footnote"."content", '') AS "footnoteContent"
          FROM "Word"
          LEFT OUTER JOIN "TranslatorNote" ON "Word"."id" = "TranslatorNote"."wordId"
              AND "TranslatorNote"."languageId" = ${language.id}::uuid
          LEFT OUTER JOIN "Footnote" ON "Word"."id" = "Footnote"."wordId"
              AND "Footnote"."languageId" = ${language.id}::uuid
          LEFT OUTER JOIN "User" AS "TranslatorNoteUser" ON "TranslatorNote"."authorId" = "TranslatorNoteUser"."id"
          LEFT OUTER JOIN "User" AS "FootnoteUser" ON "Footnote"."authorId" = "FootnoteUser"."id"
          WHERE "Word"."verseId" = ${req.query.verseId}
          ORDER BY "wordId" ASC
        `;

      if (notes.length > 0) {
        return res.ok({
          data: {
            translatorNotes: Object.fromEntries(
              notes.map(
                ({
                  wordId,
                  translatorNoteAuthorName,
                  translatorNoteTimestamp,
                  translatorNoteContent,
                }) => [
                  wordId,
                  {
                    wordId,
                    authorName: translatorNoteAuthorName,
                    timestamp: +translatorNoteTimestamp,
                    content: translatorNoteContent,
                  },
                ]
              )
            ),
            footnotes: Object.fromEntries(
              notes.map(
                ({
                  wordId,
                  footnoteAuthorName,
                  footnoteTimestamp,
                  footnoteContent,
                }) => [
                  wordId,
                  {
                    wordId,
                    authorName: footnoteAuthorName,
                    timestamp: +footnoteTimestamp,
                    content: footnoteContent,
                  },
                ]
              )
            ),
          },
        });
      }
      res.notFound();
    },
  })
  .build();
