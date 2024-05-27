import { PatchPhraseTranslatorNoteRequestBody } from '@translation/api-types';
import * as z from 'zod';
import createRoute from '../../../../../../shared/Route';
import { authorize } from '../../../../../../shared/access-control/authorize';
import { client } from '../../../../../../shared/db';

export default createRoute<{ code: string; phraseId: string }>()
  .patch<PatchPhraseTranslatorNoteRequestBody, void>({
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
      }

      const userId = req.session?.user?.id;
      if (!userId) {
        throw Error('No session user.');
      }

      let phraseId: number;
      try {
        phraseId = parseInt(req.query.phraseId);
      } catch {
        res.notFound();
        return;
      }

      const phrase = await client.phrase.findUnique({
        where: { id: phraseId, languageId: language.id },
      });
      if (!phrase) {
        res.notFound();
        return;
      }

      await client.translatorNote.upsert({
        where: {
          phraseId,
        },
        create: {
          phraseId,
          content: req.body.note,
          authorId: userId,
          timestamp: new Date(),
        },
        update: {
          content: req.body.note,
          authorId: userId,
          timestamp: new Date(),
        },
      });

      res.ok();
    },
  })
  .build();
