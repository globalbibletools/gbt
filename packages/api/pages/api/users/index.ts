import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';
import {
  GetUsersResponseBody,
  InviteUserRequestBody,
} from '@translation/api-types';
import { authorize } from '../../../shared/access-control/authorize';
import { accessibleBy } from '../../../prisma/casl';
import { auth } from '../../../shared/auth';

export default createRoute()
  .get<void, GetUsersResponseBody>({
    authorize: authorize({
      action: 'read',
      subject: 'User',
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
      const email = req.body.email.toLowerCase();
      const user = await auth.createUser({
        primaryKey: {
          providerId: 'username',
          providerUserId: email,
          password: null,
        },
        attributes: {
          email,
          name: req.body.name,
        },
      });

      // TODO: send invite email

      res.created(`/api/users/${user.id}`);
    },
  })
  .build();
