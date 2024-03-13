import * as z from 'zod';
import createRoute from '../../../shared/Route';
import { PostLoginRequest } from '@translation/api-types';
import { client } from '../../../shared/db';
import { Scrypt } from 'oslo/password';

const scrypt = new Scrypt();

export default createRoute()
  .post<PostLoginRequest, void>({
    schema: z.object({
      email: z.string(),
      password: z.string(),
    }),
    async handler(req, res) {
      const user = await client.user.findUnique({
        where: {
          email: req.body.email.toLowerCase(),
        },
      });
      if (!user?.hashedPassword) {
        res.unauthorized();
        return;
      }

      if (!(await scrypt.verify(user.hashedPassword, req.body.password))) {
        res.unauthorized();
        return;
      }

      await res.login(user.id);

      res.ok();
    },
  })
  .build();
