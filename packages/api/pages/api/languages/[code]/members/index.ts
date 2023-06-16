import * as z from 'zod';
import {
  LanguageRole,
  PostLanguageMemberRequestBody,
} from '@translation/api-types';
import { client, Prisma } from '../../../../../shared/db';
import createRoute from '../../../../../shared/Route';
import { authorize } from '../../../../../shared/access-control/authorize';
import { NotFoundError } from '../../../../../shared/errors';

export default createRoute<{ code: string }>()
  // .get<void, GetLanguageResponseBody>({
  //   authorize: authorize((req) => ({
  //     action: 'read',
  //     subject: 'Language',
  //     subjectId: req.query.code,
  //   })),
  //   async handler(req, res) {
  //     const language = await client.language.findUnique({
  //       where: {
  //         code: req.query.code,
  //       },
  //     });

  //     if (language) {
  //       res.ok({
  //         data: {
  //           code: language.code,
  //           name: language.name,
  //         },
  //       });
  //     } else {
  //       res.notFound();
  //     }
  //   },
  // })
  .post<PostLanguageMemberRequestBody, void>({
    // authorize: authorize((req) => ({
    //   action: 'translate',
    //   subject: 'Language',
    //   subjectId: req.query.code,
    // })),
    schema: z.object({
      email: z.string(),
      roles: z.array(
        z.enum(Object.values(LanguageRole) as [LanguageRole, ...LanguageRole[]])
      ),
    }),
    async handler(req, res) {
      const user = await client.user.findUnique({
        where: {
          email: req.body.email,
        },
        select: {
          id: true,
        },
      });

      if (!user) {
        // TODO: invite
        return res.invalid([]);
      }

      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
        select: {
          id: true,
        },
      });

      if (!language) {
        throw new NotFoundError();
      }

      await client.languageMemberRole.createMany({
        data: [...req.body.roles, LanguageRole.Viewer].map((role) => ({
          languageId: language.id,
          userId: user.id,
          role,
        })),
      });

      res.ok();
    },
  })
  .build();
