import {
  GetLanguageResponseBody,
  PatchLanguageResponseBody,
} from '@translation/api-types';
import { ApiRequest, ApiResponse } from '../../../helpers';
import { client, Prisma } from '../../../db';

export default async function (
  req: ApiRequest<{ code: string }>,
  res: ApiResponse<GetLanguageResponseBody | PatchLanguageResponseBody>
) {
  switch (req.method) {
    case 'GET': {
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
      break;
    }
    case 'PATCH': {
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
          if (error.code === 'P2001') {
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
      break;
    }
    default: {
      res.status(405).json({
        errors: [{ code: 'MethodNotAllowed' }],
      });
    }
  }
}
