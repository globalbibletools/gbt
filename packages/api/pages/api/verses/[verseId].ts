import { GetVerseResponseBody } from '@translation/api-types';
import createRoute from '../../../shared/Route';
import { client, Prisma } from '../../../shared/db';

export default createRoute<{ verseId: string }>()
  .get<void, GetVerseResponseBody>({
    async handler(req, res) {
      const verse = await client.verse.findUnique({
        where: {
          id: req.query.verseId,
        },
        include: {
          words: {
            orderBy: {
              id: Prisma.SortOrder.asc,
            },
            include: {
              form: true,
            },
          },
        },
      });

      if (verse) {
        res.ok({
          data: {
            id: verse.id,
            words: verse.words.map((word) => ({
              id: word.id,
              text: word.text,
              lemmaId: word.form.lemmaId,
              formId: word.formId,
              grammar: word.form.grammar,
            })),
          },
        });
      } else {
        res.notFound();
      }
    },
  })
  .build();
