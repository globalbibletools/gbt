import * as z from 'zod';
import { PatchWordGlossRequestBody } from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import { client } from '../../../../../shared/db';

export default createRoute<{ code: string; wordId: string }>()
  .patch<PatchWordGlossRequestBody, void>({
    schema: z.object({
      gloss: z.string().optional(),
    }),
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

      await client.gloss.upsert({
        where: {
          wordId_languageId: {
            wordId: req.query.wordId,
            languageId: language.id,
          },
        },
        update: {
          gloss: req.body.gloss,
        },
        create: {
          wordId: req.query.wordId,
          languageId: language.id,
          gloss: req.body.gloss,
        },
      });

      res.ok();
    },
  })
  .build();
