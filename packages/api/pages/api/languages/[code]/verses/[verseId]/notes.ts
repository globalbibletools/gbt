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
          w."id" as "wordId",
          COALESCE(tn_u."name", '') AS "translatorNoteAuthorName",
          COALESCE(fn_u."name", '') AS "footnoteAuthorName",
          tn."timestamp" AS "translatorNoteTimestamp",
          fn."timestamp" AS "footnoteTimestamp",
          COALESCE(tn."content", '') AS "translatorNoteContent",
          COALESCE(fn."content", '') AS "footnoteContent"
        FROM "Word" AS w

        LEFT JOIN LATERAL (
          SELECT ph.id FROM "PhraseWord" AS phw
          JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
          WHERE phw."wordId" = w.id
            AND ph."languageId" = ${language.id}::uuid
        ) AS ph ON true

        LEFT JOIN "TranslatorNote" tn ON tn."phraseId" = ph.id
        LEFT JOIN "User" AS tn_u ON tn_u.id = tn."authorId"

        LEFT JOIN "Footnote" fn ON fn."phraseId" = ph.id
        LEFT JOIN "User" AS fn_u ON fn_u.id = fn."authorId"

        WHERE w."verseId" = ${req.query.verseId}
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
