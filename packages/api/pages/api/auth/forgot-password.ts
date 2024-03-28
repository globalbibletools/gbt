import * as z from 'zod';
import createRoute from '../../../shared/Route';
import mailer from '../../../shared/mailer';
import { randomBytes } from 'crypto';
import { client } from '../../../shared/db';
import { redirects } from '../../../shared/redirects';
import { PostForgotPasswordRequestBody } from '@translation/api-types';

export default createRoute()
  .post<PostForgotPasswordRequestBody, void>({
    schema: z.object({ email: z.string() }),
    async handler(req, res) {
      const user = await client.user.findUnique({
        where: { email: req.body.email },
      });
      if (!user) {
        return res.ok();
      }
      const { token } = await client.resetPasswordToken.upsert({
        where: { userId: user.id },
        update: { expires: Date.now() + 60 * 60 * 1000 },
        create: {
          userId: user.id,
          token: randomBytes(12).toString('hex'),
          expires: Date.now() + 60 * 60 * 1000,
        },
      });

      const url = redirects.resetPassword(token);
      await mailer.sendEmail({
        email: req.body.email,
        subject: 'Reset Password',
        text: `Please click the following link to reset your password\n\n${url}`,
        html: `<a href="${url}">Click here</a> to reset your password`,
      });
      return res.ok();
    },
  })
  .build();
