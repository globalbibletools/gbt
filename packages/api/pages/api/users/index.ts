import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';
import mailer from '../../../shared/mailer';
import {
  GetUsersResponseBody,
  PostUserRequestBody,
} from '@translation/api-types';
import { authorize } from '../../../shared/access-control/authorize';
import { accessibleBy } from '../../../prisma/casl';
import { auth } from '../../../shared/auth';
import { randomBytes } from 'crypto';

export default createRoute()
  .get<void, GetUsersResponseBody>({
    authorize: authorize({
      action: 'read',
      subject: 'AuthUser',
    }),
    async handler(req, res) {
      const users = await client.authUser.findMany({
        where: accessibleBy(req.policy).AuthUser,
        include: {
          systemRoles: true,
        },
      });

      res.ok({
        data: users.map((user) => ({
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          systemRoles: user.systemRoles.map(({ role }) => role),
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
        attributes: {
          email,
        },
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

      await mailer.sendEmail({
        to: email,
        subject: 'GlobalBibleTools Invite',
        text: `You've been invited to globalbibletools.com:\n${url.toString()}`,
        html: `<p>You've been invited to globalbibletools.com:</p><p><a href="${url.toString()}">Log In</a></p>`,
      });

      res.created(`/api/users/${user.id}`);
    },
  })
  .build();
