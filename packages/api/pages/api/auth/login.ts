import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { PostLoginRequest } from '@translation/api-types';
import { auth } from '../../../shared/auth';

export default createRoute()
  .post<PostLoginRequest, void>({
    schema: z.object({
      email: z.string(),
      password: z.string(),
    }),
    async handler(req, res) {
      let key;
      try {
        key = await auth.useKey(
          'username',
          req.body.email.toLowerCase(),
          req.body.password
        );
        if (!key.passwordDefined) {
          res.unauthorized();
          return;
        }
      } catch {
        res.unauthorized();
        return;
      }

      await res.login(key.userId);
      res.ok();
    },
  })
  .build();
