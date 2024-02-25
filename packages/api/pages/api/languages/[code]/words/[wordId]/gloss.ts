import {
  GlossState,
  GlossSource,
  PatchWordGlossRequestBody,
} from '@translation/api-types';
import * as z from 'zod';
import createRoute from '../../../../../../shared/Route';
import { authorize } from '../../../../../../shared/access-control/authorize';
import { PrismaTypes, client } from '../../../../../../shared/db';

export default createRoute<{ code: string; wordId: string }>()
  .patch<PatchWordGlossRequestBody, void>({
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

      const fields: { gloss?: string; state?: PrismaTypes.GlossState } = {};

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

      const originalGloss = await client.gloss.findUnique({
        where: {
          wordId_languageId: {
            wordId: req.query.wordId,
            languageId: language.id,
          },
        },
      });
      await client.gloss.upsert({
        where: {
          wordId_languageId: {
            wordId: req.query.wordId,
            languageId: language.id,
          },
        },
        update: fields,
        create: {
          ...fields,
          wordId: req.query.wordId,
          languageId: language.id,
        },
      });

      await client.glossHistoryEntry.create({
        data: {
          wordId: req.query.wordId,
          languageId: language.id,
          userId: req.session?.user?.id,
          gloss:
            fields.gloss !== originalGloss?.gloss ? fields.gloss : undefined,
          state:
            fields.state !== originalGloss?.state ? fields.state : undefined,
          source: GlossSource.User,
        },
      });

      res.ok();
    },
  })
  .build();
