import * as z from 'zod';
import {
  GetLanguageResponseBody,
  PatchLanguageRequestBody,
  PatchLanguageResponseBody,
} from '@translation/api-types';
import { client, Prisma } from '../../../db';
import { languageSchema } from './schemas';
import createRoute from '../../../Route';

const patchRequestSchema = (id?: string): z.ZodType<PatchLanguageRequestBody> =>
  z.object({
    data: languageSchema(id),
  });

export default createRoute<{ code: string }>()
  .get<void, GetLanguageResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });

      if (language) {
        res.status(200).json({
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
        res.status(404).json({
          errors: [{ code: 'NotFound' }],
        });
      }
    },
  })
  .patch<PatchLanguageRequestBody, PatchLanguageResponseBody>({
    schema: (req) => patchRequestSchema(req.query.code),
    async handler(req, res) {
      const data: Prisma.LanguageUpdateInput = {};

      const { attributes } = req.body.data;

      if (attributes.name) {
        data.name = attributes.name;
      }

      try {
        const language = await client.language.update({
          where: {
            code: req.query.code,
          },
          data,
        });

        res.status(200).json({
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
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            return res.status(404).json({
              errors: [{ code: 'NotFound' }],
            });
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    },
  })
  .build();
