import { GetLanguageImportStatusRequestBody } from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';
import { client } from '../../../../shared/db';

export default createRoute()
  .post<GetLanguageImportStatusRequestBody, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    schema: z.object({
      import: z.string(),
    }),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });

      // Don't allow importing English glosses. They are already imported from
      // seed data.
      if (!language || language.code == 'en') {
        res.notFound();
        return;
      }

      // TODO: query DB for import status

      res.ok();
    },
  })
  .build();
