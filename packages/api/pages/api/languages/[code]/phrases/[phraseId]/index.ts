import createRoute from '../../../../../../shared/Route';
import { authorize } from '../../../../../../shared/access-control/authorize';
import { client } from '../../../../../../shared/db';

export default createRoute<{ code: string; phraseId: string }>()
  .delete<void, void>({
    authorize: authorize((req) => ({
      action: 'translate',
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
        res.notFound();
        return;
      }

      let phraseId: number;
      try {
        phraseId = parseInt(req.query.phraseId);
      } catch {
        res.notFound();
        return;
      }

      await client.phrase.update({
        where: {
          id: phraseId,
          languageId: language.id,
        },
        data: {
          deletedAt: new Date(),
          deletedBy: req.session?.user?.id,
        },
      });

      res.ok();
    },
  })
  .build();
