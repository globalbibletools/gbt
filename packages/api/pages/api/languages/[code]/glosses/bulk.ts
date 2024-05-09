import {
  Gloss,
  GlossState,
  PostBulkGlossesRequestBody,
} from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import * as z from 'zod';
import { authorize } from '../../../../../shared/access-control/authorize';
import { Prisma, client } from '../../../../../shared/db';

export default createRoute<{ code: string }>()
  .post<PostBulkGlossesRequestBody, void>({
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

      const entriesToPatch = Object.entries(req.body.data)
        .map(([wordId, { gloss, state }]) => ({
          wordId,
          gloss,
          // If the gloss is empty, the state should be unapproved
          state: gloss === '' ? GlossState.Unapproved : state,
        }))
        .filter(
          // If the gloss is undefined and the state is undefined, nothing will be updated, making the entry useless.
          ({ gloss, state }) => gloss !== undefined || state !== undefined
        );

      if (entriesToPatch.length > 0) {
        await client.$transaction(async (tx) => {
          const oldGlosses = Object.fromEntries(
            (
              await tx.gloss.findMany({
                where: {
                  phrase: {
                    words: {
                      some: {
                        wordId: {
                          in: entriesToPatch.map(({ wordId }) => wordId),
                        },
                      },
                    },
                  },
                },
                include: {
                  phrase: {
                    select: {
                      words: {
                        select: { wordId: true },
                      },
                    },
                  },
                },
              })
            ).map(({ phrase, ...data }) => [phrase.words[0].wordId, data])
          );

          await tx.$executeRaw`
            WITH phw AS (
              INSERT INTO "PhraseWord" ("phraseId", "wordId")
              SELECT
                nextval(pg_get_serial_sequence('"Phrase"', 'id')),
                w.id
              FROM "Word" AS w
              LEFT JOIN (
                SELECT * FROM "PhraseWord" AS phw
                JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
                WHERE ph."languageId" = ${language.id}::uuid
              ) ph ON ph."wordId" = w.id
              WHERE w.id IN (${Prisma.join(
                entriesToPatch.map((entry) => entry.wordId)
              )})
              RETURNING "phraseId", "wordId"
            )
            INSERT INTO "Phrase" (id, "languageId")
            SELECT phw."phraseId", ${language.id}::uuid FROM phw
          `;

          const patchedGlosses = await tx.$queryRaw<
            { wordId: string; gloss: string; state: GlossState }[]
          >`
            WITH data (word_id, gloss, state) AS (VALUES ${Prisma.join(
              entriesToPatch.map(
                ({ wordId, gloss, state }) =>
                  Prisma.sql`(${wordId}, ${gloss}, ${
                    state ?? oldGlosses[wordId]?.state ?? GlossState.Unapproved
                  }::"GlossState")`
              )
            )}),
            gloss AS (
              INSERT INTO "Gloss"("phraseId", "gloss", "state")
              SELECT ph.id, data.gloss, data.state FROM data
              JOIN "PhraseWord" AS phw ON phw."wordId" = data.word_id
              JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
              WHERE ph."languageId" = ${language.id}::uuid
              ON CONFLICT ("phraseId")
                  DO UPDATE SET
                      "gloss" = COALESCE(EXCLUDED."gloss", "Gloss"."gloss"),
                      "state" = COALESCE(EXCLUDED."state", "Gloss"."state")
              RETURNING *
            )
            SELECT phw."wordId", gloss.gloss, gloss.state FROM gloss
            JOIN "Phrase" AS ph ON ph.id = gloss."phraseId"
            JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
          `;

          if (patchedGlosses.length > 0) {
            await tx.$executeRaw`
            INSERT INTO "GlossHistoryEntry"("languageId", "userId", "wordId", "gloss", "state", "source")
            VALUES ${Prisma.join(
              patchedGlosses.map((patchedGloss) => {
                const oldGloss = oldGlosses[patchedGloss.wordId];
                return Prisma.sql`
                    (${language.id}::uuid,
                    ${req.session?.user?.id}::uuid,
                    ${patchedGloss.wordId},
                    NULLIF(${patchedGloss.gloss}, ${oldGloss?.gloss}),
                    NULLIF(${patchedGloss.state}, ${oldGloss?.state})::"GlossState",
                    'USER')`;
              })
            )}
        `;
          }
        });
      }
      res.ok();
    },
  })
  .build();
