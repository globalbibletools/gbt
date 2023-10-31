import {
  GetLanguageResponseBody,
  PatchLanguageRequestBody,
} from '@translation/api-types';
import { client, Prisma } from '../../../../shared/db';
import { languageSchema } from '../schemas';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';

export default createRoute<{ code: string }>()
  .get<void, GetLanguageResponseBody>({
    authorize: authorize((req) => ({
      action: 'read',
      subject: 'Language',
      subjectId: req.query.code,
    })),
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
            font: language.font,
            textDirection: language.textDirection,
            bibleTranslationIds: language.bibleTranslationIds,
          },
        });
      } else {
        res.notFound();
      }
    },
  })
  .patch<PatchLanguageRequestBody, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    schema: languageSchema.omit({ code: true }).partial(),
    async handler(req, res) {
      const data: Prisma.LanguageUpdateInput = {};

      if (req.body.name) {
        data.name = req.body.name;
      }
      if (req.body.font) {
        data.font = req.body.font;
      }
      if (req.body.bibleTranslationIds) {
        data.bibleTranslationIds = req.body.bibleTranslationIds;
      }
      if (req.body.textDirection) {
        data.textDirection = req.body.textDirection;
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
