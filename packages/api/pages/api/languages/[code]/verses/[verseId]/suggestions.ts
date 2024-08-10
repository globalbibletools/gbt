import { GetVerseSuggestionsResponseBody } from '@translation/api-types';
import { client } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';
import { machineTranslationClient } from '../../../../../../shared/machine-translation';
import languageMap from '../../../../../../../../data/language-mapping.json';
import { Language, Prisma } from '@prisma/client';

interface WordQuery {
  wordId: string;
  gloss?: string;
  suggestions?: string[];
  refGloss?: string;
  machineGloss?: string;
}

// This is an optimized sql command for saving the machine glosses for future use.
// The goal is to save the gloss produced by Google Translate for every word in the database that has the same English gloss.
async function saveMachineGlosses(
  glossMap: Record<string, string>,
  language: string
) {
  await client.$executeRaw`
    INSERT INTO "MachineGloss" ("wordId", "gloss", "languageId")
    SELECT phw."wordId", map.gloss, ${language}::uuid FROM "Gloss" AS g
    JOIN "Phrase" AS ph ON ph.id = g."phraseId"
    JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
    JOIN (VALUES ${Prisma.join(
      Object.entries(glossMap).map(
        ([eng, gloss]) => Prisma.sql`(${eng}, ${gloss})`
      )
    )}) AS map ("eng", "gloss") ON g.gloss ILIKE map.eng
    WHERE ph."languageId" = (SELECT id FROM "Language" WHERE code = 'eng')
      AND ph."deletedAt" IS NULL
    ON CONFLICT ON CONSTRAINT "MachineGloss_pkey"
    DO UPDATE SET gloss = EXCLUDED."gloss"
  `;
}

// In order to generate glosses from Google Translate,
// we need to filter out the words in the verse that have no reference gloss to translate from
// and the words in the verse that already have suggestions or a gloss
// The result is a mapping of english glosses to Google translate glosses in the target language.
async function generateMachineGlossesForVerse(
  words: WordQuery[],
  language: Language
): Promise<Record<string, string>> {
  const languageCode = languageMap[language.code as keyof typeof languageMap];
  if (!languageCode || !machineTranslationClient) return {};

  const charRegex = /\w/;
  const wordsToTranslate = Array.from(
    new Set(
      words
        .filter(
          (word) =>
            (word.suggestions ?? []).length === 0 &&
            !word.gloss &&
            !word.machineGloss
        )
        .map((w) => w.refGloss?.toLowerCase())
        .filter((gloss): gloss is string => !!gloss?.match(charRegex))
    )
  );
  let machineGlosses: string[] = [];
  if (wordsToTranslate.length > 0) {
    machineGlosses = await machineTranslationClient.translate(
      wordsToTranslate,
      languageCode
    );
  }
  const wordMapper = Object.fromEntries(
    wordsToTranslate.map((word, i) => [word, machineGlosses[i]])
  );

  return wordMapper;
}

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVerseSuggestionsResponseBody>({
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
        SELECT
          w.id AS "wordId",
          target.gloss AS "gloss",
          ref.gloss AS "refGloss",
          ma.gloss AS "machineGloss",
          suggestion.suggestions AS "suggestions"
        FROM "Word" AS w

        LEFT JOIN (
          SELECT
            id AS form_id,
            array_agg(gloss ORDER BY count DESC) AS "suggestions"
          FROM (
            SELECT w."formId" AS id, g.gloss, COUNT(*)
            FROM "Word" AS w
            JOIN "PhraseWord" AS phw ON phw."wordId" = w.id
            JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
            JOIN "Gloss" AS g ON g."phraseId" = ph.id
            WHERE ph."languageId" = ${language.id}::uuid
              AND ph."deletedAt" IS NULL
              AND g.gloss IS NOT NULL
              AND EXISTS (
                SELECT 1 FROM "Word" AS wd
                  WHERE wd."verseId" = ${req.query.verseId}
                    AND wd."formId" = w."formId"
              )
            GROUP BY w."formId", g.gloss
          ) AS form_suggestion
          GROUP BY id
        ) AS suggestion ON suggestion.form_id = w."formId"

        LEFT JOIN LATERAL (
          SELECT phw."wordId", g.gloss FROM "PhraseWord" AS phw
          JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          WHERE phw."wordId" = w.id
            AND ph."languageId" = ${language.id}::uuid
            AND ph."deletedAt" IS NULL
        ) AS target ON true

        LEFT JOIN LATERAL (
          SELECT phw."wordId", g.gloss FROM "PhraseWord" AS phw
          JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          WHERE phw."wordId" = w.id
            AND ph."languageId" = (SELECT id FROM "Language" WHERE code = 'eng')
            AND ph."deletedAt" IS NULL
        ) AS ref ON true

        LEFT JOIN "MachineGloss" AS ma ON ma."wordId" = w.id
          AND ma."languageId" = ${language.id}::uuid

        WHERE w."verseId" = ${req.query.verseId}
        ORDER BY w.id
      `;

      if (words.length === 0) {
        res.notFound();
      } else {
        const glossMap = await generateMachineGlossesForVerse(words, language);
        res.ok({
          data: words.map((word) => {
            return {
              wordId: word.wordId,
              suggestions: word.suggestions ?? [],
              machineGloss:
                word.machineGloss ??
                (word.refGloss
                  ? glossMap[word.refGloss.toLowerCase()]
                  : undefined),
            };
          }),
        });

        if (Object.keys(glossMap).length > 0) {
          await saveMachineGlosses(glossMap, language.id);
        }
      }
    },
  })
  .build();
