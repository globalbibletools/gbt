import * as z from 'zod';
import {
  GetLanguagesResponseBody,
  PostLanguageRequestBody,
} from '@translation/api-types';
import { client } from '../../../shared/db';
import { languageSchema } from './schemas';
import createRoute from '../../../shared/Route';
import { authorize } from '../../../shared/access-control/authorize';

export default createRoute<void>()
  .get<void, GetLanguagesResponseBody>({
    async handler(req, res) {
      const languages = await client.language.findMany();
      res.ok({
        data: languages.map((language) => ({
          code: language.code,
          name: language.name,
        })),
      });
    },
  })
  .post<PostLanguageRequestBody, void>({
    schema: languageSchema,
    authorize: authorize({ action: 'create', subject: 'User' }),
    async handler(req, res) {
      await client.language.create({
        data: {
          code: req.body.code,
          name: req.body.name,
        },
      });
      res.created(`/api/languages/${req.body.code}`);
    },
  })
  .build();
