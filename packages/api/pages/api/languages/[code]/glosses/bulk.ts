import { GlossState, PostBulkGlossesRequestBody } from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import * as z from 'zod';
import { authorize } from '../../../../../shared/access-control/authorize';
import { Prisma, client } from '../../../../../shared/db';
import { GlossSource } from '@prisma/client';

export default createRoute<{ code: string }>()
  .post<PostBulkGlossesRequestBody, void>({
    schema: z.object({
      data: z.array(
        z.object({
          phraseId: z.number(),
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

      const entriesToPatch = req.body.data.filter(
        // If the gloss is undefined and the state is undefined, nothing will be updated, making the entry useless.
        ({ gloss, state }) => gloss !== undefined || state !== undefined
      );
      entriesToPatch.forEach((entry) => {
        if (entry.gloss === '') {
          entry.state = GlossState.Unapproved;
        }
      });

      if (entriesToPatch.length > 0) {
        await client.$transaction(async (tx) => {
          const oldGlosses = Object.fromEntries(
            (
              await tx.gloss.findMany({
                where: {
                  phraseId: {
                    in: entriesToPatch.map(({ phraseId }) => phraseId),
                  },
                  phrase: {
                    languageId: language.id,
                    deletedAt: null,
                  },
                },
              })
            ).map(({ phraseId, ...data }) => [phraseId, data])
          );

          const patchedGlosses = await tx.$queryRaw<
            { phraseId: number; gloss: string; state: GlossState }[]
          >`
            WITH data (phrase_id, gloss, state) AS (VALUES ${Prisma.join(
              entriesToPatch.map(
                ({ phraseId, gloss, state }) =>
                  Prisma.sql`(${phraseId}, ${gloss}, ${
                    state ??
                    oldGlosses[phraseId]?.state ??
                    GlossState.Unapproved
                  }::"GlossState")`
              )
            )})
            INSERT INTO "Gloss"("phraseId", "gloss", "state")
            SELECT ph.id, data.gloss, data.state FROM data
            JOIN "Phrase" AS ph ON ph.id = data.phrase_id
            WHERE ph."deletedAt" IS NULL
            ON CONFLICT ("phraseId")
                DO UPDATE SET
                    "gloss" = COALESCE(EXCLUDED."gloss", "Gloss"."gloss"),
                    "state" = COALESCE(EXCLUDED."state", "Gloss"."state")
            RETURNING *
          `;

          if (patchedGlosses.length > 0) {
            await tx.glossEvent.createMany({
              data: patchedGlosses.map((patchedGloss) => {
                const oldGloss = oldGlosses[patchedGloss.phraseId];

                return {
                  phraseId: patchedGloss.phraseId,
                  userId: req.session?.user?.id,
                  gloss:
                    patchedGloss.gloss !== oldGloss?.gloss
                      ? patchedGloss.gloss
                      : undefined,
                  state:
                    patchedGloss.state !== oldGloss?.state
                      ? patchedGloss.state
                      : undefined,
                  source: GlossSource.USER,
                };
              }),
            });
          }
        });
      }
      res.ok();
    },
  })
  .build();
