import * as z from 'zod';
import { Prisma } from '../../../prisma/client';
import {
  GetLanguagesResponseBody,
  PostLanguageRequestBody,
  PostLanguageResponseBody,
} from '@translation/api-types';
import { ApiRequest, ApiResponse } from '../../../helpers';
import { client } from '../../../db';
import { languageSchema } from './schemas';

const postRequestSchema: z.ZodType<PostLanguageRequestBody> = z.object({
  data: languageSchema(),
});

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
        let body;
        const parseResult = postRequestSchema.safeParse(req.body);
        if (parseResult.success) {
          body = parseResult.data;
        } else {
          const { error } = parseResult;
          const typeMismatch = error.issues.find(
            (issue) => 'data.type' === issue.path.join('.')
          );
          if (typeMismatch) {
            return res.status(409).json({
              errors: [{ code: 'TypeMismatch' }],
            });
          } else {
            return res.status(422).end({
              errors: [{ code: 'InvalidRequestShape' }],
            });
          }
        }

        const language = await client.language.create({
          data: {
            code: body.data.id,
            name: body.data.attributes.name,
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
            return res.status(409).json({
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
