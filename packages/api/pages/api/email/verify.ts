import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { auth } from '../../../shared/auth';
import { InvalidTokenError } from '../../../shared/errors';
import { PrismaTypes, client } from '../../../shared/db';
import { PostEmailVerificationRequest } from '@translation/api-types';
import mailer, { EmailNotVerifiedError } from '../../../shared/mailer';

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
      if (!verification || verification.expires < Date.now()) {
        throw new InvalidTokenError();
      }

      const authKey = (await auth.getAllUserKeys(verification.userId)).find(
        (key) => key.providerId === 'username'
      );
      if (authKey && authKey.providerUserId !== verification.email) {
        // We have to manually handle whether the old email was still verified
        // because the email will have changed for the user when it comes time to send it.
        const user = await client.authUser.findUnique({
          where: {
            id: authKey.userId,
          },
        });
        const oldEmailVerified =
          user?.emailStatus === PrismaTypes.EmailStatus.VERIFIED;

        await client.$transaction([
          client.authKey.update({
            where: {
              id: `username:${authKey.providerUserId}`,
            },
            data: {
              id: `username:${verification.email}`,
            },
          }),
          client.authUser.update({
            where: {
              id: authKey.userId,
            },
            data: {
              emailStatus: PrismaTypes.EmailStatus.VERIFIED,
            },
          }),
          client.userEmailVerification.delete({
            where: {
              token: req.body.token,
            },
          }),
        ]);

        if (oldEmailVerified) {
          await mailer.sendEmail({
            email: authKey.providerUserId,
            subject: 'Password Changed',
            text: `Your email address for Global Bible Tools was changed to ${verification.email}.`,
            html: `Your email address for Global Bible Tools was changed to <strong>${verification.email}</strong>.`,
          });
        } else {
          throw new EmailNotVerifiedError(authKey.providerUserId);
        }
      }

      res.ok();
    },
  })
  .build();
