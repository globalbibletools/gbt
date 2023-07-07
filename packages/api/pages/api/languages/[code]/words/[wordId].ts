import * as z from 'zod';
import { PatchWordGlossRequestBody } from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import { client } from '../../../../../shared/db';
import { authorize } from '../../../../../shared/access-control/authorize';

export default createRoute<{ code: string; wordId: string }>()
  .patch<PatchWordGlossRequestBody, void>({
    schema: z.object({
      gloss: z.string().optional(),
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

      const normalizedGloss = req.body.gloss?.normalize('NFD');

      await client.gloss.upsert({
        where: {
          wordId_languageId: {
            wordId: req.query.wordId,
            languageId: language.id,
          },
        },
        update: {
          gloss: normalizedGloss,
        },
        create: {
          wordId: req.query.wordId,
          languageId: language.id,
          gloss: normalizedGloss,
        },
      });

      res.ok();
    },
  })
  .build();
