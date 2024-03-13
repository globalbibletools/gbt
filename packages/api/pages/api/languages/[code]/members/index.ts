import * as z from 'zod';
import {
  GetLanguageMembersResponseBody,
  LanguageRole,
  PostLanguageMemberRequestBody,
} from '@translation/api-types';
import { client, PrismaTypes } from '../../../../../shared/db';
import createRoute from '../../../../../shared/Route';
import { authorize } from '../../../../../shared/access-control/authorize';
import { NotFoundError } from '../../../../../shared/errors';
import { auth } from '../../../../../shared/auth';
import mailer from '../../../../../shared/mailer';
import { randomBytes } from 'crypto';
import { redirects } from '../../../../../shared/redirects';

export default createRoute<{ code: string }>()
  .get<void, GetLanguageMembersResponseBody>({
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
        const users = await client.user.findMany({
          where: {
            languageRoles: {
              some: {
                languageId: language.id,
              },
            },
          },
          include: {
            languageRoles: {
              where: {
                languageId: language.id,
              },
            },
          },
        });

        res.ok({
          data: users.map((user) => ({
            userId: user.id,
            name: user.name ?? undefined,
            email: user.email,
            roles: user.languageRoles
              .map((role) => role.role)
              .filter(
                (role): role is LanguageRole =>
                  role !== PrismaTypes.LanguageRole.VIEWER
              ),
          })),
        });
      } else {
        res.notFound();
      }
    },
  })
  .post<PostLanguageMemberRequestBody, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    schema: z.object({
      email: z.string(),
      roles: z.array(
        z.enum(Object.values(LanguageRole) as [LanguageRole, ...LanguageRole[]])
      ),
    }),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
        select: {
          id: true,
        },
      });

      if (!language) {
        throw new NotFoundError();
      }

      const email = req.body.email.toLowerCase();
      let user = await client.user.findUnique({
        where: { email },
        select: { id: true },
      });
      let userId: string;

      if (user) {
        userId = user.id;
        await client.languageMemberRole.createMany({
          data: [...req.body.roles, PrismaTypes.LanguageRole.VIEWER].map(
            (role) => ({
              languageId: language.id,
              userId: userId,
              role,
            })
          ),
        });
      } else {
        const token = randomBytes(12).toString('hex');
        user = await client.user.create({
          data: {
            email,
            invitation: {
              create: {
                token,
                expires: 60 * 60,
              },
            },
            languageRoles: {
              create: [...req.body.roles, PrismaTypes.LanguageRole.VIEWER].map(
                (role) => ({
                  languageId: language.id,
                  role,
                })
              ),
            },
          },
        });
        userId = user.id;

        const url = redirects.invite(token);
        await mailer.sendEmail({
          email,
          subject: 'GlobalBibleTools Invite',
          text: `You've been invited to globalbibletools.com. Click the following to accept your invite and get started.\n\n${url.toString()}`,
          html: `You've been invited to globalbibletools.com. <a href="${url.toString()}">Click here<a/> to accept your invite and get started.`,
        });
      }

      res.created(`/api/languages/${req.query.code}/members/${userId}`);
    },
  })
  .build();
