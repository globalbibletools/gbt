import * as z from 'zod';
import {
  GetLanguagesResponseBody,
  PostLanguageRequestBody,
  PostLanguageResponseBody,
} from '@translation/api-types';
import { client } from '../../../shared/db';
import { languageSchema } from './schemas';
import createRoute from '../../../shared/Route';

export default createRoute<void>()
  .get<void, GetLanguagesResponseBody>({
    async handler(req, res) {
      const languages = await client.language.findMany();
      res.ok({
        data: languages.map((language) => ({
          type: 'language',
          id: language.code,
          attributes: {
            name: language.name,
          },
          links: {
            self: `${req.url}/${language.code}`,
          },
        })),
        links: {
          self: `${req.url}`,
        },
      });
    },
  })
  .post<PostLanguageRequestBody, PostLanguageResponseBody>({
    schema: z.object({
      data: languageSchema(),
    }),
    async handler(req, res) {
      const language = await client.language.create({
        data: {
          code: req.body.data.id,
          name: req.body.data.attributes.name,
        },
      });
      res.created({
        data: {
          type: 'language',
          id: language.code,
          attributes: {
            name: language.name,
          },
          links: {
            self: `${req.url}/${language.code}`,
          },
        },
      });
    },
  })
  .build();
