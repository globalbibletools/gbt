import { GetVerseGlossesResponseBody } from '@translation/api-types';
import { client, PrismaTypes } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';

type WordsRawQuery = {
  wordId: string;
  gloss: string;
  suggestions: string[] | null;
  state: PrismaTypes.GlossState;
}[];

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVerseGlossesResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        return res.notFound();
      }

      const words = await client.$queryRaw<WordsRawQuery>`
        WITH "VerseWord" AS (
        	SELECT "Word"."id", "Word"."formId" FROM "Verse"
        	JOIN "Word" ON "Verse"."id" = "Word"."verseId"
        	WHERE "verseId" = ${req.query.verseId}
        ),
        "Suggestion" AS (
        	SELECT "id", array_agg("gloss" ORDER BY "count" DESC) AS "suggestions" FROM (
        		SELECT "VerseWord"."id", "Gloss"."gloss", COUNT(1) FROM "VerseWord"
        		JOIN "Word" ON "Word"."formId" = "VerseWord"."formId"
        		JOIN "Gloss" ON "Word"."id" = "Gloss"."wordId"
        			AND "Gloss"."languageId" = ${language.id}::uuid
              AND "Gloss"."state" = 'APPROVED'
        		GROUP BY "VerseWord"."id", "Gloss"."gloss"
        	) AS "WordSuggestion"
        	GROUP BY "id"
        )
        SELECT "VerseWord"."id" as "wordId", "Gloss"."gloss", "Suggestion"."suggestions", "Gloss"."state" FROM "VerseWord"
        LEFT OUTER JOIN "Suggestion" ON "VerseWord"."id" = "Suggestion"."id"
        JOIN "Gloss" ON "VerseWord"."id" = "wordId"
        WHERE "Gloss"."languageId" = ${language.id}::uuid
      `;

      if (words.length === 0) {
        res.notFound();
      } else {
        res.ok({
          data: words.map((word) => ({
            ...word,
            suggestions: word.suggestions ?? [],
          })),
        });
      }
    },
  })
  .build();
