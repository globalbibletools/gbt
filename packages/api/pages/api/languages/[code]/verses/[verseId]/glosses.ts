import {
  GetVerseGlossesResponseBody,
  GlossSource,
  GlossState,
  PostBulkGlossesRequestBody,
} from '@translation/api-types';
import { client, PrismaTypes } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';
import { machineTranslationClient } from '../../../../../../shared/machine-translation';
import languageMap from '../../../../../../../../data/language-mapping.json';
import { Language, Prisma } from '@prisma/client';
import { authorize } from '../../../../../../shared/access-control/authorize';
import * as z from 'zod';

interface WordQuery {
  wordId: string;
  gloss?: string;
  suggestions?: string[];
  state?: PrismaTypes.GlossState;
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
    SELECT "Gloss"."wordId", "Map"."gloss", ${language}::uuid FROM "Gloss"
    JOIN "Language" ON "Gloss"."languageId" = "Language"."id"
    JOIN (VALUES ${Prisma.join(
      Object.entries(glossMap).map(
        ([eng, gloss]) => Prisma.sql`(${eng}, ${gloss})`
      )
    )})
      AS "Map" ("eng","gloss")
      ON "Gloss"."gloss" ILIKE "Map"."eng"
    WHERE "Language"."code" = 'eng'
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
        SELECT
          w.id AS "wordId",
          target.gloss AS "gloss", target.state AS "state",
          ref.gloss AS "refGloss",
          ma.gloss AS "machineGloss",
          suggestion.suggestions AS "suggestions"
        FROM "Word" AS w

        LEFT JOIN (
          SELECT
            id AS form_id,
            array_agg(gloss ORDER BY count DESC) AS "suggestions"
          FROM (
            SELECT form.id, g.gloss, COUNT(1) FROM (
              SELECT DISTINCT ON(wd."formId") wd."formId" AS id FROM "Word" AS wd
              WHERE wd."verseId" = ${req.query.verseId}
            ) AS form
            JOIN "Word" AS w ON w."formId" = form.id
            JOIN "PhraseWord" AS phw ON phw."wordId" = w.id
            JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
            JOIN "Gloss" AS g ON g."phraseId" = ph.id
            WHERE ph."languageId" = ${language.id}::uuid
              AND g.gloss IS NOT NULL
            GROUP BY form.id, g.gloss
          ) AS form_suggestion
          GROUP BY id
        ) AS suggestion ON suggestion.form_id = w."formId"

        LEFT JOIN LATERAL (
          SELECT phw."wordId", g.gloss, g.state FROM "PhraseWord" AS phw
          JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
            AND ph."languageId" = ${language.id}::uuid
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          WHERE phw."wordId" = w.id
        ) AS target ON true

        LEFT JOIN LATERAL (
          SELECT phw."wordId", g.gloss FROM "PhraseWord" AS phw
          JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          WHERE phw."wordId" = w.id
            AND ph."languageId" = (SELECT id FROM "Language" WHERE code = 'eng')
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
              gloss: word.gloss ?? '',
              suggestions: word.suggestions ?? [],
              state: word.state ?? PrismaTypes.GlossState.UNAPPROVED,
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
