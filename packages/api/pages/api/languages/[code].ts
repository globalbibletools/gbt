import {
  GetLanguageResponseBody,
  PatchLanguageRequestBody,
} from '@translation/api-types';
import { client, Prisma } from '../../../shared/db';
import { languageSchema } from './schemas';
import createRoute from '../../../shared/Route';

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
            code: language.code,
            name: language.name,
          },
        });
      } else {
        res.notFound();
      }
    },
  })
  .patch<PatchLanguageRequestBody, void>({
    schema: languageSchema.omit({ code: true }).partial(),
    async handler(req, res) {
      const data: Prisma.LanguageUpdateInput = {};

      if (req.body.name) {
        data.name = req.body.name;
      }

      await client.language.update({
        where: {
          code: req.query.code,
        },
        data,
      });

      res.ok();
    },
  })
  .build();
