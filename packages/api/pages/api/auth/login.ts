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
      let userId;
      try {
        const user = await client.user.findFirst({
          where: {
            email: req.body.email.toLowerCase(),
          },
        });

        console.log(user);

        if (!user?.hashedPassword) {
          res.unauthorized();
          return;
        }

        if (
          !(await scrypt.verify(
            user.hashedPassword.slice(3),
            req.body.password
          ))
        ) {
          res.unauthorized();
          return;
        }

        userId = user.id;
      } catch (error) {
        res.unauthorized();
        return;
      }

      await res.login(userId);
      res.ok();
    },
  })
  .build();
