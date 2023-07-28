import {
  PostLanguageImportRequestBody,
  bookKeys,
} from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';
import { importServer } from '../../../../shared/env';

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
      for (const key of bookKeys) {
        const importUrl = `${importServer}/${req.body.import}Glosses/${key}Gloss.js`;
        // const response = await fetch(importServer);
        console.log(importUrl);
      }
      res.ok();
    },
  })
  .build();
