import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';
import { PostResetPasswordRequestBody } from '@translation/api-types';
import { Scrypt } from 'oslo/password';
import { InvalidTokenError } from '../../../shared/errors';

const scrypt = new Scrypt();

export default createRoute()
  .post<PostResetPasswordRequestBody, void>({
    schema: z.object({
      token: z.string(),
      password: z.string(),
    }),
    async handler(req, res) {
      const resetPasswordToken = await client.resetPasswordToken.findUnique({
        where: { token: req.body.token },
      });
      if (!resetPasswordToken || resetPasswordToken.expires < Date.now()) {
        throw new InvalidTokenError();
      }

      const user = await client.user.findUnique({
        where: { id: resetPasswordToken.userId },
      });
      if (!user) {
        throw new InvalidTokenError();
      }

      await client.$transaction([
        client.user.update({
          where: { id: resetPasswordToken.userId },
          data: { hashedPassword: await scrypt.hash(req.body.password) },
        }),
        client.resetPasswordToken.delete({ where: { token: req.body.token } }),
      ]);

      await res.login(user.id);

      return res.ok();
    },
  })
  .build();
