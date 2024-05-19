import { GetVerseNotesResponseBody } from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { client } from '../../../../../../shared/db';

interface Note {
  content: string;
  authorName?: string;
  timestamp: string;
}

interface Phrase {
  id: string;
  wordIds: string[];
  footnote?: Note;
  translatorNote?: Note;
}

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

      const notes = await client.$queryRaw<Phrase[]>`
        SELECT
          ph.*,
          CASE
            WHEN tn."phraseId" IS NOT NULL THEN	JSON_BUILD_OBJECT(
              'content', tn.content,
              'authorName', tn_u.name,
              'timestamp', tn.timestamp
            )
            ELSE NULL
          END AS "translatorNote",
          CASE
            WHEN fn."phraseId" IS NOT NULL THEN	JSON_BUILD_OBJECT(
              'content', fn.content,
              'authorName', fn_u.name,
              'timestamp', fn.timestamp
            )
            ELSE NULL
          END AS "footnote"
        FROM (
          SELECT phw."phraseId" AS id, ARRAY_AGG(phw."wordId") AS "wordIds" FROM "Phrase" AS ph
          JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
          JOIN "Word" AS w ON w.id = phw."wordId"
          WHERE ph."languageId" = ${language.id}::uuid
            AND w."verseId" = ${req.query.verseId}
          GROUP BY phw."phraseId"
        ) AS ph

        LEFT JOIN "TranslatorNote" tn ON tn."phraseId" = ph.id
        LEFT JOIN "User" AS tn_u ON tn_u.id = tn."authorId"

        LEFT JOIN "Footnote" fn ON fn."phraseId" = ph.id
        LEFT JOIN "User" AS fn_u ON fn_u.id = fn."authorId"
      `;

      console.log(notes);

      if (notes.length > 0) {
        return res.ok({
          data: notes,
        });
      }
      res.notFound();
    },
  })
  .build();
