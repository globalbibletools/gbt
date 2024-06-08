import { GlossState, PostBulkGlossesRequestBody } from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import * as z from 'zod';
import { authorize } from '../../../../../shared/access-control/authorize';
import { Prisma, client } from '../../../../../shared/db';

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

          const patchedGlosses = await tx.$queryRaw<
            { wordId: string; gloss: string; state: GlossState }[]
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
            )}),
            gloss AS (
              INSERT INTO "Gloss"("phraseId", "gloss", "state")
              SELECT ph.id, data.gloss, data.state FROM data
              JOIN "Phrase" AS ph ON ph.id = data.phrase_id
              WHERE ph."deletedAt" IS NULL
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
