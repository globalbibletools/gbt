import * as z from 'zod';
import {
  GetLanguageMembersResponseBody,
  LanguageRole,
  PostLanguageMemberRequestBody,
} from '@translation/api-types';
import { client } from '../../../../../shared/db';
import createRoute from '../../../../../shared/Route';
import { authorize } from '../../../../../shared/access-control/authorize';
import { NotFoundError } from '../../../../../shared/errors';
import { auth } from '../../../../../shared/auth';
import mailer from '../../../../../shared/mailer';
import { randomBytes } from 'crypto';

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
        const users = await client.authUser.findMany({
          where: {
            languageRoles: {
              every: {
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
            email: user.email ?? undefined,
            roles: user.languageRoles.map((role) => role.role),
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
      redirectUrl: z.string(),
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
      let userId: string;
      try {
        const key = await auth.getKey('username', email);
        userId = key?.userId;
      } catch {
        const user = await auth.createUser({
          primaryKey: {
            providerId: 'username',
            providerUserId: email,
            password: null,
          },
          attributes: {
            email,
          },
        });

        const token = randomBytes(12).toString('hex');
        await auth.createKey(user.id, {
          type: 'single_use',
          providerId: 'email-verification',
          providerUserId: token,
          password: null,
          expiresIn: 60 * 60,
        });

        const url = new URL(`${origin}/api/auth/login`);
        url.searchParams.append('token', token);
        url.searchParams.append('redirectUrl', req.body.redirectUrl);

        await mailer.sendEmail({
          to: user.email,
          subject: 'GlobalBibleTools Invite',
          text: `You've been invited to globalbibletools.com:\n${url.toString()}`,
          html: `<p>You've been invited to globalbibletools.com:</p><p><a href="${url.toString()}">Log In</a></p>`,
        });

        userId = user.id;
      }

      await client.languageMemberRole.createMany({
        data: [...req.body.roles, LanguageRole.Viewer].map((role) => ({
          languageId: language.id,
          userId: userId,
          role,
        })),
      });

      res.ok();
    },
  })
  .build();
