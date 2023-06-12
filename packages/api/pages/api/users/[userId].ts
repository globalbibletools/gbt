import * as z from 'zod';
import { SystemRole, UpdateUserRequestBody } from '@translation/api-types';
import { authorize } from '../../../shared/access-control/authorize';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';

export default createRoute<{ userId: string }>()
  .patch<UpdateUserRequestBody, void>({
    schema: z.object({
      systemRoles: z
        .array(
          z.enum(Object.values(SystemRole) as [SystemRole, ...SystemRole[]])
        )
        .optional(),
    }),
    authorize: authorize({
      action: 'administer',
      subject: 'User',
    }),
    async handler(req, res) {
      const user = await client.user.findUnique({
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

      const { systemRoles } = req.body;
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

      res.ok();
    },
  })
  .build();
