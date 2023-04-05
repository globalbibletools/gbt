import * as z from 'zod';
import {
  GetLanguageResponseBody,
  PatchLanguageRequestBody,
  PatchLanguageResponseBody,
} from '@translation/api-types';
import { client, Prisma } from '../../../db';
import { languageSchema } from './schemas';
import createRoute from '../../../Route';

export default createRoute<{ code: string }>()
  .get<void, GetLanguageResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });

      if (language) {
        res.ok({
          data: {
            type: 'language',
            id: language.code,
            attributes: {
              name: language.name,
            },
            links: {
              self: `${req.url}`,
            },
          },
        });
      } else {
        res.notFound();
      }
    },
  })
  .patch<PatchLanguageRequestBody, PatchLanguageResponseBody>({
    schema: (req) =>
      z.object({
        data: languageSchema(req.query.code),
      }),
    async handler(req, res) {
      const data: Prisma.LanguageUpdateInput = {};

      const { attributes } = req.body.data;

      if (attributes.name) {
        data.name = attributes.name;
      }

      const language = await client.language.update({
        where: {
          code: req.query.code,
        },
        data,
      });

      res.ok({
        data: {
          type: 'language',
          id: language.code,
          attributes: {
            name: language.name,
          },
          links: {
            self: `${req.url}`,
          },
        },
      });
    },
  })
  .build();
