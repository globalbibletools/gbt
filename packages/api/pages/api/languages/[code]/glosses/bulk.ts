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
                  languageId: language.id,
                  wordId: { in: entriesToPatch.map(({ wordId }) => wordId) },
                },
              })
            ).map(({ wordId, ...data }) => [wordId, data])
          );

          // We can't use execute raw because we need the returned rows. See https://stackoverflow.com/questions/75191559/using-prisma-how-can-i-insert-using-executeraw-function-and-return-the-values
          const patchedGlosses = await tx.$queryRaw<Gloss[]>`
            INSERT INTO "Gloss"("languageId", "wordId", "gloss", "state") VALUES ${Prisma.join(
              entriesToPatch.map(
                ({ wordId, gloss, state }) =>
                  Prisma.sql`(${language.id}::uuid, ${wordId}, ${gloss}, ${state}::"GlossState")`
              )
            )}
            ON CONFLICT ("languageId", "wordId")
                DO UPDATE SET 
                    "gloss" = COALESCE(EXCLUDED."gloss", "Gloss"."gloss"),
                    "state" = COALESCE(EXCLUDED."state", "Gloss"."state")
            RETURNING *;
        `;

          const updatedGlosses = patchedGlosses.filter(
            (patchedGloss) => !!oldGlosses[patchedGloss.wordId]
          );

          if (updatedGlosses.length > 0) {
            await tx.$executeRaw`
            INSERT INTO "GlossHistoryEntry"("languageId", "userId", "wordId", "gloss", "state", "source") 
            VALUES ${Prisma.join(
              updatedGlosses.map((updatedGloss) => {
                const oldGloss = oldGlosses[updatedGloss.wordId];
                return Prisma.sql`
                    (${language.id}::uuid, 
                    ${req.session?.user?.id}::uuid, 
                    ${updatedGloss.wordId}, 
                    NULLIF(${updatedGloss.gloss}, ${oldGloss.gloss}), 
                    NULLIF(${updatedGloss.state}, ${oldGloss.state})::"GlossState", 
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
