import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';
import {
  GetUsersResponseBody,
  InviteUserRequestBody,
} from '@translation/api-types';
import { authorize } from '../../../shared/access-control/authorize';
import { accessibleBy } from '../../../prisma/casl';

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
          email: user.email ?? undefined,
          systemRoles: user.systemRoles.map(({ role }) => role),
        })),
      });
    },
  })
  .post<InviteUserRequestBody, void>({
    schema: z.object({
      email: z.string(),
      name: z.string(),
    }),
    authorize: authorize({
      action: 'create',
      subject: 'User',
    }),
    async handler(req, res) {
      const user = await client.user.create({
        data: {
          email: req.body.email.toLowerCase(),
          name: req.body.name,
        },
      });

      // In the future, we will want to send an invite email,
      // but for now the frontend can send the standard login email.
      // NextAuth doesn't provide a way to initiate login from the server.

      res.created(`/api/users/${user.id}`);
    },
  })
  .build();
