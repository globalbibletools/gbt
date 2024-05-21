import { GlossState } from '@prisma/client';
import { client } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';
import { GetVersePhrasesResponseBody } from '@translation/api-types';

interface Note {
  content: string;
  authorName: string;
  timestamp: number;
}

interface Gloss {
  text?: string;
  state: GlossState;
}

interface Phrase {
  id: number;
  wordIds: string[];
  footnote: Note | null;
  translatorNote: Note | null;
  gloss: Gloss | null;
}

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVersePhrasesResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        return res.notFound();
      }

      // TODO: hide translator notes when not a member of the language
      const phrases = await client.$queryRaw<Phrase[]>`
        SELECT
          ph.*,

          CASE
            WHEN g."phraseId" IS NOT NULL
            THEN JSON_BUILD_OBJECT(
              'text', g.gloss,
              'state', g.state
            )
            ELSE NULL
          END AS gloss,

          CASE
            WHEN tn."content" IS NOT NULL
            THEN JSON_BUILD_OBJECT(
              'content', tn."content",
              'authorName', COALESCE(tn_u."name", 'Unknown'),
              'timestamp', tn."timestamp"
            )
            ELSE NULL
          END AS "translatorNote",

          CASE
            WHEN fn."content" IS NOT NULL
            THEN JSON_BUILD_OBJECT(
              'content', fn."content",
              'authorName', COALESCE(fn_u."name", 'Unknown'),
              'timestamp', fn."timestamp"
            )
            ELSE NULL
          END AS "footnote"

        FROM (
          SELECT
            phw."phraseId" AS id,
            ARRAY_AGG(phw."wordId") AS "wordIds"
          FROM "Phrase" AS ph
          JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
          JOIN "Word" AS w ON phw."wordId" = w.id
          WHERE w."verseId" = ${req.query.verseId}
            AND ph."languageId" = ${language.id}::uuid
          GROUP BY phw."phraseId"
        ) AS ph

        LEFT JOIN "Footnote" AS fn ON fn."phraseId" = ph.id
        LEFT JOIN "User" AS fn_u ON fn_u.id = fn."authorId"

        LEFT JOIN "TranslatorNote" AS tn ON tn."phraseId" = ph.id
        LEFT JOIN "User" AS tn_u ON tn_u.id = tn."authorId"

        LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id
      `;

      if (phrases.length === 0) {
        const verse = await client.verse.findUnique({
          where: {
            id: req.query.verseId,
          },
          select: {
            id: true,
          },
        });
        if (!verse) {
          res.notFound();
          return;
        }
      }

      res.ok({
        data: phrases.map((phrase) => ({
          id: phrase.id,
          wordIds: phrase.wordIds,
          footnote: phrase.footnote ?? undefined,
          translatorNote: phrase.translatorNote ?? undefined,
          gloss: phrase.gloss ?? undefined,
        })),
      });
    },
  })
  .build();
