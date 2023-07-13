import { PostLanguageImportRequestBody } from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../shared/Route';
import { authorize } from '../../../shared/access-control/authorize';
import { client } from '../../../shared/db';

export default createRoute()
  .post<PostLanguageImportRequestBody, void>({
    schema: z.object({
      import: z.string(),
      code: z.string(),
      name: z.string(),
    }),
    authorize: authorize({ action: 'create', subject: 'Language' }),
    async handler(req, res) {
      await client.language.create({
        data: {
          code: req.body.code,
          name: req.body.name,
        },
      });
      // TODO: implement import logic.
      console.log('import language:', req.body.import);

      res.created(`/api/languages/${req.body.code}`);
    },
  })
  .build();
