import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { InvalidTokenError } from '../../../shared/errors';
import { PrismaTypes, client } from '../../../shared/db';
import { PostEmailVerificationRequest } from '@translation/api-types';
import mailer from '../../../shared/mailer';

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
        include: {
          user: true,
        },
      });
      if (!verification || verification.expires < Date.now()) {
        throw new InvalidTokenError();
      }

      await client.$transaction([
        client.user.update({
          where: {
            id: verification.userId,
          },
          data: {
            email: verification.email,
            emailStatus: PrismaTypes.EmailStatus.VERIFIED,
          },
        }),
        client.userEmailVerification.delete({
          where: {
            token: req.body.token,
          },
        }),
      ]);

      if (verification.user.emailStatus === PrismaTypes.EmailStatus.VERIFIED) {
        await mailer.sendEmail({
          email: verification.user.email,
          subject: 'Email Changed',
          text: `Your email address for Global Bible Tools was changed to ${verification.email}.`,
          html: `Your email address for Global Bible Tools was changed to <strong>${verification.email}</strong>.`,
        });
      }

      res.ok();
    },
  })
  .build();
