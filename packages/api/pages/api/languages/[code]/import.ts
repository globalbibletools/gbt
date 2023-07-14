import { PostLanguageImportRequestBody } from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';

export default createRoute()
  .post<PostLanguageImportRequestBody, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    schema: z.object({
      import: z.string(),
    }),
    async handler(req, res) {
      // TODO: implement import logic.
      console.log('import language:', req.body.import);
      // simulate the processing time
      await new Promise<void>((resolve) => {
        throw Error('test');
        setTimeout(() => {
          resolve();
        }, 10000);
      });
      res.ok();
    },
  })
  .build();
