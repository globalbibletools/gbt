import * as z from 'zod';
import createRoute from '../../../shared/Route';
import {
  GetInviteRequestQuery,
  GetInviteResponseBody,
  PostInviteRequestBody,
} from '@translation/api-types';
import { NotFoundError } from '../../../shared/errors';
import { EmailStatus } from '@translation/db';
import { client } from '../../../shared/db';
import { Scrypt } from 'oslo/password';

const scrypt = new Scrypt();

export default createRoute()
  .get<GetInviteRequestQuery, GetInviteResponseBody>({
    schema: z.object({
      token: z.string(),
    }),
    async handler(req, res) {
      const invite = await client.userInvitation.findUnique({
        where: {
          token: req.body.token,
        },
        include: {
          user: {
            select: { email: true },
          },
        },
      });

      if (!invite) {
        throw new NotFoundError();
      }

      res.ok({
        email: invite.user.email,
      });
    },
  })
  .post<PostInviteRequestBody, void>({
    schema: z.object({
      token: z.string(),
      name: z.string(),
      password: z.string(),
    }),
    async handler(req, res) {
      const invite = await client.userInvitation.findUnique({
        where: {
          token: req.body.token,
        },
      });
      if (!invite) {
        throw new NotFoundError();
      }

      await client.$transaction([
        client.user.update({
          where: {
            id: invite.userId,
          },
          data: {
            hashedPassword: await scrypt.hash(req.body.password),
            name: req.body.name,
            emailStatus: EmailStatus.VERIFIED,
          },
        }),
        client.userInvitation.delete({
          where: {
            userId: invite.userId,
          },
        }),
      ]);

      await res.login(invite.userId);

      res.ok();
    },
  })
  .build();
