import {
  GetVerseGlossesResponseBody,
  GlossState,
} from '@translation/api-types';
import { client, Prisma } from '../../../../../../shared/db';
import createRoute from '../../../../../../shared/Route';

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetVerseGlossesResponseBody>({
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });

      if (language) {
        const verse = await client.verse.findUnique({
          where: {
            id: req.query.verseId,
          },
          include: {
            words: {
              include: {
                glosses: {
                  where: {
                    languageId: language.id,
                  },
                },
              },
              orderBy: {
                id: Prisma.SortOrder.asc,
              },
            },
          },
        });

        if (verse) {
          const glosses = await Promise.all(
            verse.words.map(async (word) =>
              client.gloss.groupBy({
                by: ['gloss'],
                where: {
                  word: {
                    formId: word.formId,
                  },
                  languageId: language.id,
                },
                _count: {
                  gloss: true,
                },
                orderBy: {
                  _count: {
                    gloss: Prisma.SortOrder.desc,
                  },
                },
              })
            )
          );

          res.ok({
            data: verse.words.map((word, i) => {
              const glossEntry = word.glosses.at(0);
              const state = glossEntry?.state;
              return {
                wordId: word.id,
                gloss: glossEntry?.gloss ?? undefined,
                suggestions: glosses[i]
                  .map((doc) => doc.gloss)
                  .filter((gloss): gloss is string => !!gloss),
                state: state ?? GlossState.Unapproved,
              };
            }),
          });
          return;
        }
      }

      res.notFound();
    },
  })
  .build();
