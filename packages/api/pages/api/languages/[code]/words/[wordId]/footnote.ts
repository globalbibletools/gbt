import { PatchWordFootnoteRequestBody } from '@translation/api-types';
import * as z from 'zod';
import createRoute from '../../../../../../shared/Route';
import { authorize } from '../../../../../../shared/access-control/authorize';
import { client } from '../../../../../../shared/db';

export default createRoute<{ code: string; wordId: string }>()
  .patch<PatchWordFootnoteRequestBody, void>({
    schema: z.object({
      note: z.string(),
    }),
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
      } else if (!req.session || !req.session.user) {
        throw Error('No session user.');
      }

      const fields = {
        timestamp: new Date(),
        authorId: req.session.user.id,
        content: req.body.note,
      };
      await client.footnote.upsert({
        where: {
          wordId_languageId: {
            wordId: req.query.wordId,
            languageId: language.id,
          },
        },
        update: fields,
        create: {
          ...fields,
          wordId: req.query.wordId,
          languageId: language.id,
        },
      });

      res.ok();
    },
  })
  .build();
