import * as z from 'zod';
import { PostPhraseRequestBody } from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import { authorize } from '../../../../../shared/access-control/authorize';
import { client } from '../../../../../shared/db';

export default createRoute<{ code: string }>()
  .post<PostPhraseRequestBody, void>({
    schema: z.object({
      wordIds: z.array(z.string()),
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

      const phrase = await client.$transaction(async (tx) => {
        const phrases = await tx.phrase.findMany({
          where: {
            deletedAt: null,
            words: {
              some: {
                wordId: { in: req.body.wordIds },
              },
            },
          },
          select: {
            words: true,
          },
        });

        if (phrases.some((phrase) => phrase.words.length > 1)) {
          res.invalid([{ code: 'WordsAlreadyInPhraseError' }]);
          return;
        }

        await tx.phrase.updateMany({
          where: {
            deletedAt: null,
            words: {
              some: {
                wordId: { in: req.body.wordIds },
              },
            },
          },
          data: {
            deletedAt: new Date(),
            deletedBy: req.session?.user?.id,
          },
        });

        return await tx.phrase.create({
          data: {
            languageId: language.id,
            createdAt: new Date(),
            createdBy: req.session?.user?.id,
            words: {
              createMany: {
                data: req.body.wordIds.map((wordId) => ({ wordId })),
              },
            },
          },
        });
      });

      if (phrase) {
        res.created(`/api/languages/${req.query.code}/phrases/${phrase.id}`);
      }
    },
  })
  .build();
