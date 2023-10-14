import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';
import mailer from '../../../shared/mailer';
import {
  GetUsersResponseBody,
  PostUserRequestBody,
} from '@translation/api-types';
import { authorize } from '../../../shared/access-control/authorize';
import { accessibleBy } from '../../../shared/access-control/casl';
import { auth } from '../../../shared/auth';
import { randomBytes } from 'crypto';
import { SystemRole } from '@translation/db';
import { redirects } from '../../../shared/redirects';

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
          auth_key: {
            where: {
              primary_key: true,
            },
          },
        },
      });

      res.ok({
        data: users.map((user) => ({
          id: user.id,
          name: user.name ?? undefined,
          email: user.auth_key[0]?.id.split(':')[1] ?? undefined,
          ...(req.session?.user?.systemRoles.includes(SystemRole.ADMIN) && {
            systemRoles: user.systemRoles.map(({ role }) => role),
            emailStatus: user.emailStatus,
          }),
        })),
      });
    },
  })
  .post<PostUserRequestBody, void>({
    schema: z.object({
      email: z.string(),
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

      const url = redirects.invite(token);
      await mailer.sendEmail({
        email,
        subject: 'GlobalBibleTools Invite',
        text: `You've been invited to globalbibletools.com. Click the following to accept your invite and get started.\n\n${url.toString()}`,
        html: `You've been invited to globalbibletools.com. <a href="${url.toString()}">Click here<a/> to accept your invite and get started.`,
      });

      res.created(`/api/users/${user.id}`);
    },
  })
  .build();
