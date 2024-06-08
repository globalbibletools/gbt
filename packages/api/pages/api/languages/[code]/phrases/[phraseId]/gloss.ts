import {
  GlossState,
  PatchPhraseGlossRequestBody,
} from '@translation/api-types';
import * as z from 'zod';
import createRoute from '../../../../../../shared/Route';
import { authorize } from '../../../../../../shared/access-control/authorize';
import { PrismaTypes, client } from '../../../../../../shared/db';

export default createRoute<{ code: string; phraseId: string }>()
  .patch<PatchPhraseGlossRequestBody, void>({
    schema: z.object({
      gloss: z.string().optional(),
      state: z
        .enum(Object.values(GlossState) as [GlossState, ...GlossState[]])
        .optional(),
    }),
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
        res.notFound();
        return;
      }

      let phraseId: number;
      try {
        phraseId = parseInt(req.query.phraseId);
      } catch {
        res.notFound();
        return;
      }

      const fields: {
        gloss?: string;
        state?: PrismaTypes.GlossState;
      } = {};

      if (typeof req.body.state !== 'undefined') {
        fields.state = req.body.state;
      }
      if (typeof req.body.gloss !== 'undefined') {
        // This ensures that glosses are coded consistently,
        // while also being compatible with fonts.
        fields.gloss = req.body.gloss.normalize('NFC');
        if (!fields.gloss) {
          fields.state = GlossState.Unapproved;
        }
      }

      await client.$transaction(async (tx) => {
        const phrase = await tx.phrase.findUnique({
          where: { id: phraseId, languageId: language.id },
          include: {
            gloss: true,
          },
        });
        if (!phrase) {
          res.notFound();
          return;
        }

        if (phrase.gloss?.gloss === req.body.gloss && phrase.gloss?.state === req.body.state) {
          res.ok()
          return
        }

        await tx.gloss.upsert({
          where: {
            phraseId,
          },
          update: fields,
          create: {
            ...fields,
            phraseId,
          },
        });

        await tx.$executeRaw`
          INSERT INTO "PhraseEvent" ("typeId", "phraseId", "userId", "timestamp", "data")
          SELECT
            (SELECT id FROM "PhraseEventType" WHERE code = 'GlossChanged'),
            v.*
          FROM (VALUES (
            ${phrase.id},
            ${req.session?.user?.id}::uuid,
            now(),
            ${JSON.stringify({
              gloss: fields.gloss !== phrase.gloss?.gloss ? fields.gloss : undefined,
              state: fields.state !== phrase.gloss?.state ? fields.state : undefined
            })}::jsonb
          )) AS v (phraseid, userid, timestamp, data)
        `
      });

      res.ok();
    },
  })
  .build();
