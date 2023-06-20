import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { PostLoginRequest, GetLoginRequest } from '@translation/api-types';
import { auth } from '../../../shared/auth';
import { randomBytes } from 'crypto';

export default createRoute()
  .get<GetLoginRequest, void>({
    schema: z.object({
      token: z.string(),
      redirectUrl: z.string(),
    }),
    async handler(req, res) {
      const key = await auth.getKey('email-verification', req.body.token);
      if (key) {
        await auth.deleteKey('email-verification', req.body.token);
        await res.login(key.userId);
        res.redirect(req.body.redirectUrl);
      } else {
        res.unauthorized();
      }
    },
  })
  .post<PostLoginRequest, void>({
    schema: z.object({
      email: z.string(),
      redirectUrl: z.string(),
    }),
    async handler(req, res) {
      const key = await auth.getKey('username', req.body.email.toLowerCase());

      if (key) {
        const token = randomBytes(12).toString('hex');
        await auth.createKey(key.userId, {
          type: 'single_use',
          providerId: 'email-verification',
          providerUserId: token,
          password: null,
          expiresIn: 60 * 60,
        });

        const url = new URL('http://localhost:4300/api/auth/login');
        url.searchParams.append('token', token);
        url.searchParams.append('redirectUrl', req.body.redirectUrl);

        console.log(url.toString());

        // TODO: send login email
      }

      res.ok();
    },
  })
  .build();
