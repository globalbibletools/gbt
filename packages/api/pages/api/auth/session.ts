import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';
import { GetSessionResponse } from '@translation/api-types';

export default createRoute()
  .get<void, GetSessionResponse>({
    async handler(req, res) {
      if (req.session?.user) {
        const user = await client.authUser.findUnique({
          where: {
            id: req.session.user.id,
          },
        });

        if (user) {
          res.ok({
            user: {
              id: user.id,
              name: user.name ?? undefined,
              email: user.email ?? undefined,
              systemRoles: req.session.user.systemRoles,
            },
          });
          return;
        }
      }

      res.ok({});
    },
  })
  .build();
