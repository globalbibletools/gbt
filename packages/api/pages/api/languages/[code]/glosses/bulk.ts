import {
  GlossSource,
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

      console.log(JSON.stringify(entriesToPatch, undefined, 1));
      await client.$executeRaw`
        WITH old_glosses as (SELECT * FROM "Gloss" WHERE "Gloss"."languageId" = ${
          language.id
        }::uuid AND "Gloss"."wordId" IN (${Prisma.join(
        entriesToPatch.map(({ wordId }) => wordId)
      )})),
        patched_rows as (
            INSERT INTO "Gloss"("languageId", "wordId", "gloss", "state") VALUES ${Prisma.join(
              entriesToPatch.map(
                ({ wordId, gloss, state }) =>
                  Prisma.sql`(${language.id}::uuid, ${wordId}, ${
                    gloss ?? null
                  }, ${state ?? null}::"GlossState")`
              )
            )}
            ON CONFLICT ("languageId", "wordId")
                DO UPDATE SET 
                    "gloss" = COALESCE(EXCLUDED."gloss", "Gloss"."gloss"),
                    "state" = COALESCE(EXCLUDED."state", "Gloss"."state")
            RETURNING *
        )
        INSERT INTO "GlossHistoryEntry"("languageId", "userId", "wordId", "gloss", "state", "source") 
        SELECT ${language.id}::uuid, 
            ${req.session?.user?.id}::uuid, 
            patched_rows."wordId", 
            NULLIF(patched_rows."gloss", old_glosses."gloss"), 
            NULLIF(patched_rows."state", old_glosses."state"), 
            'USER' 
        FROM patched_rows LEFT OUTER JOIN old_glosses ON patched_rows."wordId" = old_glosses."wordId"
        `;
      //   const entriesToInsert = entriesToPatch.filter(
      //     ({ wordId }) => !glosses[wordId]
      //   );
      //   const entriesToUpdate = entriesToPatch.filter(({ wordId, ...data }) => {
      //     const oldGloss = glosses[wordId];
      //     return (
      //       !!oldGloss &&
      //       // Only include updates where something has actually changed.
      //       ((data.gloss && data.gloss !== oldGloss.gloss) ||
      //         (data.state && data.state !== oldGloss.state))
      //     );
      //   });

      //   await client.gloss.createMany({
      //     data: entriesToInsert.map((data) => ({
      //       languageId: language.id,
      //       ...data,
      //     })),
      //   });
      //   await client.glossHistoryEntry.createMany({
      //     data: entriesToInsert.map((data) => {
      //       return {
      //         languageId: language.id,
      //         ...data,
      //         userId: req.session?.user?.id,
      //         source: GlossSource.User,
      //       };
      //     }),
      //   });

      //   if (entriesToUpdate.length > 0) {
      //     await client.$executeRaw`
      //         UPDATE "Gloss" SET
      //         "gloss" = COALESCE(gloss_updates."gloss", "Gloss"."gloss"),
      //         "state" = COALESCE(gloss_updates."state", "Gloss"."state")
      //         FROM (VALUES ${Prisma.join(
      //           entriesToUpdate.map(
      //             ({ wordId, gloss, state }) =>
      //               Prisma.sql`(${wordId}, ${gloss ?? null}, ${
      //                 state ?? null
      //               }::"GlossState")`
      //           )
      //         )}) as gloss_updates("wordId", "gloss", "state")
      //         WHERE "Gloss"."languageId" = ${language.id}::uuid
      //         AND gloss_updates."wordId" = "Gloss"."wordId"`;

      //     await client.glossHistoryEntry.createMany({
      //       data: entriesToUpdate.map(({ wordId, ...data }) => {
      //         const oldGloss = glosses[wordId];
      //         return {
      //           languageId: language.id,
      //           wordId,
      //           gloss: data.gloss !== oldGloss.gloss ? data.gloss : undefined,
      //           state: data.state !== oldGloss.state ? data.state : undefined,
      //           userId: req.session?.user?.id,
      //           source: GlossSource.User,
      //         };
      //       }),
      //     });
      //   }
      res.ok();
    },
  })
  .build();
