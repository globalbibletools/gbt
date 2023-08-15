import {
  GetUsersResponseBody,
  PostUserRequestBody,
} from '@translation/api-types';
import { randomBytes } from 'crypto';
import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { authorize } from '../../../shared/access-control/authorize';
import { auth } from '../../../shared/auth';
import { PrismaCasl, PrismaTypes, client } from '../../../shared/db';
import mailer from '../../../shared/mailer';

export default createRoute()
  .get<void, GetUsersResponseBody>({
    authorize: authorize({
      action: 'read',
      subject: 'AuthUser',
    }),
    async handler(req, res) {
      const users = await client.authUser.findMany({
        where: PrismaCasl.accessibleBy(req.policy).AuthUser,
        include: {
          systemRoles: true,
          auth_key: {
            where: {
              primary_key: true,
            },
          },
        },
      });

      res.ok({
        data: users.map((user: PrismaTypes.AuthUser) => ({
          id: user.id,
          name: user.name ?? undefined,
          email: user.auth_key[0]?.id.split(':')[1] ?? undefined,
          ...(req.session?.user?.systemRoles.includes(
            PrismaTypes.SystemRole.ADMIN
          ) && {
            systemRoles: user.systemRoles.map(
              ({ role }: { role: PrismaTypes.SystemRole }) => role
            ),
            emailStatus: user.emailStatus,
          }),
        })),
      });
    },
  })
  .post<PostUserRequestBody, void>({
    schema: z.object({
      email: z.string(),
      redirectUrl: z.string(),
    }),
    authorize: authorize({
      action: 'create',
      subject: 'AuthUser',
    }),
    async handler(req, res) {
      const email = req.body.email.toLowerCase();
      const user = await auth.createUser({
        primaryKey: {
          providerId: 'username',
          providerUserId: email,
          password: null,
        },
        attributes: {},
      });

      const token = randomBytes(12).toString('hex');
      await auth.createKey(user.id, {
        type: 'single_use',
        providerId: 'invite-verification',
        providerUserId: token,
        password: null,
        expiresIn: 60 * 60,
      });

      const url = new URL(req.body.redirectUrl);
      url.searchParams.append('token', token);

      await mailer.sendEmail(
        {
          userId: user.id,
          subject: 'GlobalBibleTools Invite',
          text: `You've been invited to globalbibletools.com. Click the following to accept your invite and get started.\n\n${url.toString()}`,
          html: `You've been invited to globalbibletools.com. <a href="${url.toString()}">Click here<a/> to accept your invite and get started.`,
        },
        true
      );

      res.created(`/api/users/${user.id}`);
    },
  })
  .build();
