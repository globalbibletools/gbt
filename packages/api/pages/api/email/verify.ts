import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { auth } from '../../../shared/auth';
import { InvalidTokenError } from '../../../shared/errors';
import { client } from '../../../shared/db';
import { PostEmailVerificationRequest } from '@translation/api-types';

export default createRoute()
  .post<PostEmailVerificationRequest, void>({
    schema: z.object({
      token: z.string(),
    }),
    async handler(req, res) {
      const verification = await client.userEmailVerification.findUnique({
        where: {
          token: req.body.token,
        },
      });
      if (!verification) {
        throw new InvalidTokenError();
      }

      if (verification.expires < Date.now()) {
        await client.userEmailVerification.delete({
          where: {
            token: req.body.token,
          },
        });
        throw new InvalidTokenError();
      }

      const authKey = (await auth.getAllUserKeys(verification.userId)).find(
        (key) => key.providerId === 'username'
      );
      if (authKey) {
        await client.authKey.update({
          where: {
            id: `username:${authKey.providerUserId}`,
          },
          data: {
            id: `username:${verification.email}`,
          },
        });
      }

      await client.userEmailVerification.delete({
        where: {
          token: req.body.token,
        },
      });
      res.ok();
    },
  })
  .build();
