import {
  GetVerseGlossesResponseBody,
  GlossState,
  PatchVerseGlossesRequestBody,
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
  suggestions: string[];
  state: PrismaTypes.GlossState;
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
            word.suggestions.length === 0 && !word.gloss && !word.machineGloss
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

      if (words.length === 0) {
        res.notFound();
      } else {
        const glossMap = await generateMachineGlossesForVerse(words, language);
        res.ok({
          data: words.map((word, i) => {
            return {
              wordId: word.wordId,
              gloss: word.gloss,
              suggestions: word.suggestions,
              state: word.state,
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
  .patch<PatchVerseGlossesRequestBody, void>({
    schema: z.object({
      data: z.record(
        z.string(),
        z.object({
          gloss: z.string().optional(),
          state: z
            .enum(Object.values(GlossState) as [GlossState, ...GlossState[]])
            .optional(),
        })
      ),
    }),
    authorize: authorize((req) => ({
      action: 'translate',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: { code: req.query.code },
      });
      if (!language) {
        return res.notFound();
      }
      // await client.$executeRaw`
      //   UPDATE "Gloss"
      //     SET "gloss" = DATA."gloss",
      //         "state" = DATA."state"
      //     FROM (VALUES ${Obje})
      // `;
      req.body.data = Object.fromEntries(
        Object.entries(req.body.data)
          .filter(
            // If the gloss is undefined and the state is undefined, nothing will be updated
            ([, { gloss, state }]) => gloss !== undefined || state !== undefined
          )
          .map(([wordId, { gloss, state }]) => [
            wordId,
            // If the gloss is empty, the state should be unapproved
            { gloss, state: gloss === '' ? GlossState.Unapproved : state },
          ])
      );

      await client.$executeRaw`
      -- WITH old_glosses as (SELECT * FROM "Gloss" 
      --   JOIN "Word" ON "Word"."id" = "Gloss"."wordId" 
      --   WHERE "languageId" = $}::uuid)
              UPDATE "Gloss"
                  SET "gloss" = COALESCE(NewData."gloss", "Gloss"."gloss")
                  SET "state" = COALESCE(NewData."state", "Gloss"."state")
              FROM (VALUES ${Prisma.join(
                Object.values(req.body.data).map(
                  ({ gloss, state }) =>
                    Prisma.sql`(${gloss ?? null}, ${state ?? null})`
                )
              )}) as NewData("gloss", "state"), "Gloss" as OldGloss
              WHERE 
                  "Gloss"."languageId" = ${language.id}
                  AND OldGloss."languageId" = ${language.id}
                  AND OldGloss."wordId" = "Gloss"."wordId"
                  AND NewData."wordId" = "Gloss"."wordId"
              RETURNING "Gloss"."wordId" as "wordId", 
                OldGloss."gloss" as "oldGloss", 
                "Gloss"."gloss" as "newGloss", 
                
                OldGloss."state" as "oldState" ;
                "Gloss"."state" as "newGloss" ;
      `;
      // -- UPDATE
      // -- --- Upsert many
      // --   WITH updated as (
      // --     INSERT INTO "Gloss" ("wordId", "languageId", "gloss", "state")
      // --       VALUES $Prisma.join(
      // --         Object.entries(req.body.data).map(
      // --           ([wordId, { gloss, state }]) =>
      // --             Prisma.sql`($wordId}, {language.id}::uuid, $
      // --               gloss ?? null
      // --             }, $state})`
      // --         )
      // --       )}
      // --     ON CONFLICT ("wordId", "languageId")
      // --       DO UPDATE SET
      // --         "gloss" = COALESCE(EXCLUDED."gloss", "Gloss"."gloss"),
      // --         "state" = COALESCE(EXCLUDED."state", "Gloss"."state")
      // --     RETURNING *)
      // --   INSERT INTO "GlossHistoryEntry" ("wordId", "languageId", "userId", "gloss", "state")
      // --     SELECT updated."wordId", updated."languageId", $
      // --       req.session?.user ?? null
      // --     }::uuid as "userId", updated."gloss", updated."state" FROM updated
      // --   ;

      // const glosses = await client.gloss.findMany({
      //   where: {
      //     languageId: language.id,
      //     wordId: { startsWith: req.query.verseId },
      //   },
      // });
      // for (const [wordId, fields] of Object.entries(req.body.data).filter(
      //   ([wordId]) => glosses.find((gloss) => gloss.wordId === wordId)
      // )) {
      //   console.log(`Meshing: ${wordId}`);
      //   await client.gloss.update({
      //     where: { wordId_languageId: { languageId: language.id, wordId } },
      //     data: fields,
      //   });
      //   console.log(`- Meshed!`);
      // }

      // console.log('Making gloss history entries for update...');
      // await client.glossHistoryEntry.createMany({
      //   data: Object.entries(req.body.data)
      //     .filter(([wordId, data]) => {
      //       const gloss = glosses.find((gloss) => gloss.wordId === wordId);
      //       return (
      //         gloss &&
      //         (gloss.gloss !== data.gloss || gloss.state !== data.state)
      //       );
      //     })
      //     .map(([wordId, { gloss, state }]) => {
      //       return {
      //         languageId: language.id,
      //         wordId,
      //         userId: req.session?.user?.id,
      //         gloss:
      //           glosses.find((gloss) => gloss.wordId === wordId)?.gloss !==
      //           gloss
      //             ? gloss
      //             : undefined,
      //         state:
      //           glosses.find((gloss) => gloss.wordId === wordId)?.state !==
      //           state
      //             ? state
      //             : undefined,
      //         source: GlossSource.User,
      //       };
      //     }),
      // });

      // console.log('Creating gloss entries...');
      // await client.gloss.createMany({
      //   data: Object.entries(req.body.data)
      //     .filter(
      //       ([wordId]) => !glosses.find((gloss) => gloss.wordId === wordId)
      //     )
      //     .map(([wordId, { gloss, state }]) => {
      //       return { languageId: language.id, wordId, gloss, state };
      //     }),
      // });
      // console.log('Making gloss history entries for create...');
      // await client.glossHistoryEntry.createMany({
      //   data: Object.entries(req.body.data)
      //     .filter(
      //       ([wordId]) => !glosses.find((gloss) => gloss.wordId === wordId)
      //     )
      //     .map(([wordId, { gloss, state }]) => {
      //       return {
      //         languageId: language.id,
      //         wordId,
      //         userId: req.session?.user?.id,
      //         gloss,
      //         state,
      //         source: GlossSource.User,
      //       };
      //     }),
      // });

      // await client.gloss.deleteMany({
      //   where: {
      //     languageId: language.id,
      //     wordId: { in: Object.keys(req.body.data) },
      //   },
      // });
      // await client.gloss.createMany({
      //   data: Object.entries(req.body.data).map(([wordId, fields]) => ({
      //     languageId: language.id,
      //     wordId,
      //     ...fields,
      //   })),
      // });

      // throw new Error(`${agBefore._count.wordId} : ${agAfter._count.wordId}`);

      // await client.gloss.updateMany({
      //   data: Object.entries(req.body.data)
      //     .filter(([wordId]) =>
      //       glosses.find((gloss) => gloss.wordId === wordId)
      //     )
      //     .map(([, { gloss, state }]) => {
      //       return {gloss, state };
      //     }),
      // });

      res.ok();
    },
  })
  .build();

/***************
  export default createRoute<{ code: string; verseId: string }>()
    .patch<ApproveAllVerseGlossesRequestBody, void>({
      authorize: authorize((req) => ({
        action: 'translate',
        subject: 'Language',
        subjectId: req.query.code,
      })),
      async handler(req, res) {
        const language = await client.language.findUnique({
          where: {
            code: req.query.code,
          },
        });
        if (!language) {
          return res.notFound();
        }
        const approvedGlosses = await client.$queryRaw<{ wordId: string }[]>`
              UPDATE "Gloss"
                  SET "Gloss"."state" = 'APPROVED'
              WHERE 
                  "Gloss"."languageId" = ${language.id}
                  AND "Gloss"."wordId" ^@ ${req.query.verseId}
                  AND "Gloss"."state" = 'UNAPPROVED'
                  AND "Gloss"."gloss" <> ''
              RETURNING "Gloss"."wordId" as "wordId"
          `;
        const result = await client.glossHistoryEntry.createMany({
          data: approvedGlosses.map(({ wordId }) => ({
            wordId,
            languageId: language.id,
            userId: req.session?.user?.id,
            state: GlossState.Approved,
            source: GlossSource.USER,
          })),
        });
        result.count;
        return;
      },
    })
    .build();

    *****************/
