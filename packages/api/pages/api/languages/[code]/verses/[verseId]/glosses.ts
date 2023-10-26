import { GetVerseGlossesResponseBody } from '@translation/api-types';
import { client, PrismaTypes } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';
import { machineTranslationClient } from '../../../../../../shared/machine-translation';
import languageMap from '../../../../../../../../data/language-mapping.json';

interface WordQuery {
  wordId: string;
  gloss?: string;
  suggestions: string[];
  state: PrismaTypes.GlossState;
  refGloss?: string;
  machineGloss?: string;
}

// In order to generate glosses from Google Translate,
// we need to filter out the words in the verse that have no reference gloss to translate from.
async function generateMachineGlossesForVerse(
  words: WordQuery[],
  language: string
): Promise<(string | undefined)[]> {
  const charRegex = /\w/;
  const wordsToTranslate = words.filter(
    (word) =>
      word.suggestions.length === 0 &&
      !word.machineGloss &&
      word.refGloss?.match(charRegex)
  );
  let machineGlosses: string[] = [];
  if (wordsToTranslate.length > 0) {
    machineGlosses = await machineTranslationClient.translate(
      wordsToTranslate.map((w) => w.refGloss ?? ''),
      language
    );
  }
  return words.map((word) => {
    const index = wordsToTranslate.findIndex((w) => w === word);
    if (index >= 0) {
      return machineGlosses[index];
    } else {
      return;
    }
  });
}

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

      const words = await client.$queryRaw<WordQuery[]>`
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
          "RefGloss"."gloss" AS "refGloss",
          "MachineGloss"."gloss" AS "machineGloss"
        FROM "VerseWord"
        LEFT OUTER JOIN "Suggestion" ON "VerseWord"."id" = "Suggestion"."id"
        LEFT OUTER JOIN "Gloss" ON "VerseWord"."id" = "Gloss"."wordId"
          AND "Gloss"."languageId" = ${language.id}::uuid
          AND "Gloss"."gloss" IS NOT NULL
        LEFT OUTER JOIN "Gloss" AS "RefGloss" ON "VerseWord"."id" = "RefGloss"."wordId"
          AND "RefGloss"."gloss" IS NOT NULL
        LEFT OUTER JOIN "MachineGloss" ON "VerseWord"."id" = "MachineGloss"."wordId"
          AND "MachineGloss"."languageId" = ${language.id}::uuid
          AND "MachineGloss"."gloss" IS NOT NULL
        JOIN "RefLanguage" ON "RefGloss"."languageId" = "RefLanguage"."id"
        ORDER BY "VerseWord"."id" ASC
      `;

      const languageCode =
        languageMap[language.code as keyof typeof languageMap];
      if (words.length === 0) {
        res.notFound();
      } else if (languageCode) {
        const machineGlosses = await generateMachineGlossesForVerse(
          words,
          languageCode
        );
        const glossesToInsert: { gloss: string; wordId: string }[] = [];
        res.ok({
          data: words.map((word, i) => {
            const machineGloss = machineGlosses[i];
            if (machineGloss && !word.machineGloss) {
              glossesToInsert.push({
                wordId: word.wordId,
                gloss: machineGloss,
              });
            }
            return {
              wordId: word.wordId,
              gloss: word.gloss,
              suggestions: word.suggestions,
              state: word.state,
              machineGloss: word.machineGloss ?? machineGlosses[i],
            };
          }),
        });
        if (glossesToInsert.length > 0) {
          await client.machineGloss.createMany({
            data: glossesToInsert.map((gloss) => ({
              wordId: gloss.wordId,
              gloss: gloss.gloss,
              languageId: language.id,
            })),
            skipDuplicates: true,
          });
        }
      }
    },
  })
  .build();
