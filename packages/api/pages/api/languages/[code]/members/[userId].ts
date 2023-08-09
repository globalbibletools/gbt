import * as z from 'zod';
import { client, PrismaTypes } from '../../../../../shared/db';
import createRoute from '../../../../../shared/Route';
import { authorize } from '../../../../../shared/access-control/authorize';
import { NotFoundError } from '../../../../../shared/errors';
import {
  LanguageRole,
  PatchLanguageMemberRequestBody,
} from '@translation/api-types';

export default createRoute<{ code: string; userId: string }>()
  .patch<PatchLanguageMemberRequestBody, void>({
    schema: z.object({
      roles: z.array(
        z.enum(Object.values(LanguageRole) as [LanguageRole, ...LanguageRole[]])
      ),
    }),
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        throw new NotFoundError();
      }

      const rolesToAdd = req.body.roles;
      const rolesToRemove = [
        PrismaTypes.LanguageRole.TRANSLATOR,
        PrismaTypes.LanguageRole.ADMIN,
      ].filter((role) => !rolesToAdd.includes(role));

      if (rolesToRemove.length > 0) {
        await client.languageMemberRole.deleteMany({
          where: {
            languageId: language.id,
            userId: req.query.userId,
            role: { in: rolesToRemove },
          },
        });
      }

      if (rolesToAdd.length > 0) {
        await client.languageMemberRole.createMany({
          data: rolesToAdd.map((role) => ({
            languageId: language.id,
            userId: req.query.userId,
            role,
          })),
          skipDuplicates: true,
        });
      }

      res.ok();
    },
  })
  .delete<void, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        throw new NotFoundError();
      }

      await client.languageMemberRole.deleteMany({
        where: {
          languageId: language.id,
          userId: req.query.userId,
        },
      });

      res.ok();
    },
  })
  .build();
