import { Prisma } from '../../../prisma/client';
import {
  GetLanguagesResponseBody,
  PostLanguageResponseBody,
} from '@translation/api-types';
import { ApiRequest, ApiResponse } from '../../../helpers';
import { client } from '../../../db';

export default async function (
  req: ApiRequest,
  res: ApiResponse<GetLanguagesResponseBody | PostLanguageResponseBody>
) {
  switch (req.method) {
    case 'GET': {
      const languages = await client.language.findMany();
      res.status(200).json({
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
      break;
    }
    case 'POST': {
      try {
        const language = await client.language.create({
          data: {
            code: req.body.data.id,
            name: req.body.data.attributes.name,
          },
        });
        res.status(201).json({
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
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            return res.status(400).json({
              errors: [{ code: 'AlreadyExists' }],
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
