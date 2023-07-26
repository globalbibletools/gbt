import { client } from '../../../../../shared/db';
import createRoute from '../../../../../shared/Route';
import { authorize } from '../../../../../shared/access-control/authorize';
import { NotFoundError } from '../../../../../shared/errors';

export default createRoute<{ code: string; userId: string }>()
  .delete<void, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });
      if (!language) {
        throw new NotFoundError();
      }

      await client.languageMemberRole.deleteMany({
        where: {
          languageId: language.id,
          userId: req.query.userId,
        },
      });

      res.ok();
    },
  })
  .build();
