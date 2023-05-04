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
          res.ok({
            data: verse.words.map((word) => ({
              wordId: word.id,
              gloss: word.glosses[0]?.gloss ?? '',
            })),
          });
          return;
        }
      }

      res.notFound();
    },
  })
  .build();
