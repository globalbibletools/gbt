import * as z from 'zod';
import { SystemRole, UpdateUserRequestBody } from '@translation/api-types';
import { authorize } from '../../../shared/access-control/authorize';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';
import { auth } from '../../../shared/auth';
import { randomBytes } from 'crypto';
import mailer from '../../../shared/mailer';
import { redirects } from '../../../shared/redirects';

export default createRoute<{ userId: string }>()
  .patch<UpdateUserRequestBody, void>({
    schema: z.object({
      name: z.string().optional(),
      password: z.string().optional(),
      email: z.string().optional(),
      systemRoles: z
        .array(
          z.enum(Object.values(SystemRole) as [SystemRole, ...SystemRole[]])
        )
        .optional(),
    }),
    authorize: authorize((req) => ({
      action: req.body.systemRoles ? 'administer' : 'update',
      subject: 'AuthUser',
    })),
    async handler(req, res) {
      const user = await client.authUser.findUnique({
        where: {
          id: req.query.userId,
        },
        include: {
          systemRoles: true,
        },
      });

      if (!user) {
        res.notFound();
        return;
      }

      const { systemRoles, name, password, email } = req.body;

      if (systemRoles) {
        await client.userSystemRole.createMany({
          data: systemRoles
            .filter((role) =>
              user.systemRoles.every((doc) => doc.role !== role)
            )
            .map((role) => ({
              userId: req.query.userId,
              role,
            })),
        });

        await client.userSystemRole.deleteMany({
          where: {
            userId: req.query.userId,
            role: { notIn: systemRoles },
          },
        });
      }

      if (name) {
        await client.authUser.update({
          where: {
            id: req.query.userId,
          },
          data: { name },
        });
      }

      if (password || email) {
        const key = (await auth.getAllUserKeys(user.id)).find(
          (key) => key.providerId === 'username'
        );
        if (key) {
          if (password) {
            await auth.updateKeyPassword(
              key.providerId,
              key.providerUserId,
              password
            );

            await mailer.sendEmail({
              userId: user.id,
              subject: 'Password Changed',
              text: `Your password for Global Bible Tools has changed.`,
              html: `Your password for Global Bible Tools has changed.`,
            });
          }

          console.log(email != key.providerUserId);
          if (email && email !== key.providerUserId) {
            const token = randomBytes(12).toString('hex');
            await client.userEmailVerification.create({
              data: {
                userId: user.id,
                token,
                email,
                expires: Date.now() + 60 * 60 * 1000,
              },
            });

            const url = redirects.emailVerification(token);
            await mailer.sendEmail({
              email,
              subject: 'Email Verification',
              text: `Please click the link to verify your new email \n\n${url.toString()}`,
              html: `<a href="${url.toString()}">Click here<a/> to verify your new email.`,
            });
          }
        }
      }

      res.ok();
    },
  })
  .build();
