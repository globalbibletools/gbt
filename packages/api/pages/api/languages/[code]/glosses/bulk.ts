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

      const glosses = Object.fromEntries(
        (
          await client.gloss.findMany({
            where: {
              languageId: language.id,
              wordId: { in: Object.keys(req.body.data) },
            },
          })
        ).map(({ wordId, ...data }) => [wordId, data])
      );

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

      const entriesToInsert = entriesToPatch.filter(
        ({ wordId }) => !glosses[wordId]
      );
      const entriesToUpdate = entriesToPatch.filter(({ wordId, ...data }) => {
        const oldGloss = glosses[wordId];
        return (
          !!oldGloss &&
          // Only include updates where something has actually changed.
          ((data.gloss && data.gloss !== oldGloss.gloss) ||
            (data.state && data.state !== oldGloss.state))
        );
      });

      await client.gloss.createMany({
        data: entriesToInsert.map((data) => ({
          languageId: language.id,
          ...data,
        })),
      });
      await client.glossHistoryEntry.createMany({
        data: entriesToInsert.map((data) => {
          return {
            languageId: language.id,
            ...data,
            userId: req.session?.user?.id,
            source: GlossSource.User,
          };
        }),
      });

      if (entriesToUpdate.length > 0) {
        await client.$executeRaw`
            UPDATE "Gloss" SET 
            "gloss" = COALESCE(gloss_updates."gloss", "Gloss"."gloss"),
            "state" = COALESCE(gloss_updates."state", "Gloss"."state")
            FROM (VALUES ${Prisma.join(
              entriesToUpdate.map(
                ({ wordId, gloss, state }) =>
                  Prisma.sql`(${wordId}, ${gloss ?? null}, ${
                    state ?? null
                  }::"GlossState")`
              )
            )}) as gloss_updates("wordId", "gloss", "state")
            WHERE "Gloss"."languageId" = ${language.id}::uuid
            AND gloss_updates."wordId" = "Gloss"."wordId"`;

        await client.glossHistoryEntry.createMany({
          data: entriesToUpdate.map(({ wordId, ...data }) => {
            const oldGloss = glosses[wordId];
            return {
              languageId: language.id,
              wordId,
              gloss: data.gloss !== oldGloss.gloss ? data.gloss : undefined,
              state: data.state !== oldGloss.state ? data.state : undefined,
              userId: req.session?.user?.id,
              source: GlossSource.User,
            };
          }),
        });
      }
      res.ok();
    },
  })
  .build();
