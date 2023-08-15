import createRoute from '../../../shared/Route';
import { client, PrismaTypes } from '../../../shared/db';
import { GetSessionResponse, LanguageRole } from '@translation/api-types';

export default createRoute()
  .get<void, GetSessionResponse>({
    async handler(req, res) {
      if (req.session?.user) {
        const user = await client.authUser.findUnique({
          where: {
            id: req.session.user.id,
          },
          include: {
            auth_key: {
              where: {
                primary_key: true,
              },
            },
          },
        });

        if (user) {
          const languages = await client.language.findMany({
            where: {
              roles: {
                some: {
                  userId: user.id,
                },
              },
            },
            include: {
              roles: {
                where: {
                  userId: user.id,
                },
              },
            },
          });

          res.ok({
            user: {
              id: user.id,
              name: user.name ?? undefined,
              email: user.auth_key[0]?.id.split(':')[1] ?? undefined,
              systemRoles: req.session.user.systemRoles,
              languages: languages.map((language) => ({
                code: language.code,
                roles: language.roles
                  .map((role) => role.role)
                  .filter(
                    (role): role is LanguageRole =>
                      role !== PrismaTypes.LanguageRole.VIEWER
                  ),
              })),
            },
          });
          return;
        }
      }

      res.ok({});
    },
  })
  .build();
