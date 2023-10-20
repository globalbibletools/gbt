import { GetVerseGlossesResponseBody } from '@translation/api-types';
import { client, PrismaTypes } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';
import { machineTranslationClient } from '../../../../../../shared/machine-translation';

type WordsRawQuery = {
  wordId: string;
  gloss?: string;
  suggestions: string[];
  state: PrismaTypes.GlossState;
  refGloss?: string;
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
        -- First we create a query with the words in a verse.
        WITH "VerseWord" AS (
        	SELECT "Word"."id", "Word"."formId" FROM "Verse"
        	JOIN "Word" ON "Verse"."id" = "Word"."verseId"
        	WHERE "verseId" = ${req.query.verseId}
        ),
        -- Then we gather suggestions for each word in the verse.
        -- First we count up each unique gloss across the entire text.
        -- Then we can build an array of suggestions in descending order of use for each word.
        "Suggestion" AS (
        	SELECT "id", array_agg("gloss" ORDER BY "count" DESC) AS "suggestions" FROM (
        		SELECT "VerseWord"."id", "Gloss"."gloss", COUNT(1) FROM "VerseWord"
        		JOIN "Word" ON "Word"."formId" = "VerseWord"."formId"
        		JOIN "Gloss" ON "Word"."id" = "Gloss"."wordId"
        			AND "Gloss"."languageId" = ${language.id}::uuid
        			AND "Gloss"."state" = 'APPROVED'
              AND "Gloss"."gloss" IS NOT NULL
        		GROUP BY "VerseWord"."id", "Gloss"."gloss"
        	) AS "WordSuggestion"
        	GROUP BY "id"
        ),
        "RefLanguage" AS (
          SELECT "id" FROM "Language"
          WHERE "code" = 'eng'
        )
        -- Now we can gather the suggestions and other data for each word in the verse.
        SELECT
          "VerseWord"."id" as "wordId",
          COALESCE("Gloss"."gloss", '') AS "gloss",
          COALESCE("Suggestion"."suggestions", '{}') AS "suggestions",
          COALESCE("Gloss"."state", 'UNAPPROVED') AS "state",
          "RefGloss"."gloss" AS "refGloss"
        FROM "VerseWord"
        LEFT OUTER JOIN "Suggestion" ON "VerseWord"."id" = "Suggestion"."id"
        LEFT OUTER JOIN "Gloss" ON "VerseWord"."id" = "Gloss"."wordId"
          AND "Gloss"."languageId" = ${language.id}::uuid
          AND "Gloss"."gloss" IS NOT NULL
        LEFT OUTER JOIN "Gloss" AS "RefGloss" ON "VerseWord"."id" = "RefGloss"."wordId"
          AND "RefGloss"."gloss" IS NOT NULL
        JOIN "RefLanguage" ON "RefGloss"."languageId" = "RefLanguage"."id"
        ORDER BY "VerseWord"."id" ASC
      `;

      if (words.length === 0) {
        res.notFound();
      } else {
        const start = performance.now();
        const machineGlosses = await machineTranslationClient.translate(
          words.map((w) => w.refGloss ?? ''),
          'es'
        );
        console.log(machineGlosses);
        console.log('timing', performance.now() - start);
        res.ok({ data: words });
      }
    },
  })
  .build();
