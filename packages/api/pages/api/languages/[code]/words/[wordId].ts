import * as z from 'zod';
import { GlossState, PatchWordGlossRequestBody } from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import { PrismaTypes, client } from '../../../../../shared/db';
import { authorize } from '../../../../../shared/access-control/authorize';

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

      if (typeof req.body.gloss !== 'undefined') {
        fields.gloss = req.body.gloss.normalize('NFD');
      }
      if (typeof req.body.state !== 'undefined') {
        fields.state = req.body.state;
      }

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

      res.ok();
    },
  })
  .build();
