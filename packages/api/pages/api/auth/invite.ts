import * as z from 'zod';
import createRoute from '../../../shared/Route';
import {
  GetInviteRequestQuery,
  GetInviteResponseBody,
  PostInviteRequestBody,
} from '@translation/api-types';
import { auth } from '../../../shared/auth';
import { NotFoundError } from '../../../shared/errors';
import { EmailStatus } from '../../../prisma/client';

export default createRoute()
  .get<GetInviteRequestQuery, GetInviteResponseBody>({
    schema: z.object({
      token: z.string(),
    }),
    async handler(req, res) {
      try {
        const key = await auth.getKey('invite-verification', req.body.token);
        const user = await auth.getUser(key.userId);
        res.ok({
          email: user.email,
        });
      } catch {
        throw new NotFoundError();
      }
    },
  })
  .post<PostInviteRequestBody, void>({
    schema: z.object({
      token: z.string(),
      name: z.string(),
    }),
    async handler(req, res) {
      let key;
      try {
        key = await auth.getKey('invite-verification', req.body.token);
        await auth.deleteKey('invite-verification', req.body.token);
      } catch {
        throw new NotFoundError();
      }

      await auth.updateUserAttributes(key.userId, {
        name: req.body.name,
        emailStatus: EmailStatus.VERIFIED,
      });
      await res.login(key.userId);

      res.ok();
    },
  })
  .build();
