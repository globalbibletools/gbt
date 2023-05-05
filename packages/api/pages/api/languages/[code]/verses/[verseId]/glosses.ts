import { GetVerseGlossesResponseBody } from '@translation/api-types';
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
            data: verse.words.map((word, i) => ({
              wordId: word.id,
              approvedGloss: word.glosses[0]?.gloss ?? '',
              glosses: glosses[i].map((doc) => doc.gloss),
            })),
          });
          return;
        }
      }

      res.notFound();
    },
  })
  .build();
