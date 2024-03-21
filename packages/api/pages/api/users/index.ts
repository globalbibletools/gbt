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
import { randomBytes } from 'crypto';
import { SystemRole } from '@translation/db';
import { redirects } from '../../../shared/redirects';

export default createRoute()
  .get<void, GetUsersResponseBody>({
    authorize: authorize({
      action: 'read',
      subject: 'User',
    }),
    async handler(req, res) {
      const users = await client.user.findMany({
        where: accessibleBy(req.policy).User,
        include: {
          systemRoles: true,
        },
      });

      res.ok({
        data: users.map((user) => ({
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
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
      systemRoles: z
        .array(
          z.enum(Object.values(SystemRole) as [SystemRole, ...SystemRole[]])
        )
        .optional(),
    }),
    authorize: authorize({
      action: 'create',
      subject: 'User',
    }),
    async handler(req, res) {
      const email = req.body.email.toLowerCase();
      const token = randomBytes(12).toString('hex');

      const user = await client.user.create({
        data: {
          email,
          invitation: {
            create: {
              token,
              expires: 60 * 60,
            },
          },
          ...(req.body.systemRoles && {
            systemRoles: {
              create: req.body.systemRoles.map((role) => ({ role })),
            },
          }),
        },
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
