import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { PostLoginRequest, GetLoginRequest } from '@translation/api-types';
import { auth } from '../../../shared/auth';
import { randomBytes } from 'crypto';
import mailer from '../../../shared/mailer';
import { origin } from '../../../shared/env';

export default createRoute()
  .get<GetLoginRequest, void>({
    schema: z.object({
      token: z.string(),
      redirectUrl: z.string(),
    }),
    async handler(req, res) {
      try {
        const key = await auth.getKey('email-verification', req.body.token);
        await auth.deleteKey('email-verification', req.body.token);
        await res.login(key.userId);
        res.redirect(req.body.redirectUrl);
      } catch {
        const url = new URL(req.body.redirectUrl);
        url.searchParams.append('error', 'invalid-token');
        res.redirect(url.toString());
      }
    },
  })
  .post<PostLoginRequest, void>({
    schema: z.object({
      email: z.string(),
      redirectUrl: z.string(),
    }),
    async handler(req, res) {
      let key;
      try {
        key = await auth.getKey('username', req.body.email.toLowerCase());
      } catch {
        // We don't want the user to know that we couldn't find the key, so we return 204 in all cases.
      }

      if (key) {
        const token = randomBytes(12).toString('hex');
        await auth.createKey(key.userId, {
          type: 'single_use',
          providerId: 'email-verification',
          providerUserId: token,
          password: null,
          expiresIn: 60 * 60,
        });

        const url = new URL(`${origin}/api/auth/login`);
        url.searchParams.append('token', token);
        url.searchParams.append('redirectUrl', req.body.redirectUrl);

        await mailer.sendEmail({
          to: key.providerUserId,
          subject: 'GlobalBibleTools Login',
          text: `Log in to globalbibletools.com:\n${url.toString()}`,
          html: `<p>Log in to globalbibletools.com:</p><p><a href="${url.toString()}">Log In</a></p>`,
        });
      }

      res.ok();
    },
  })
  .build();
