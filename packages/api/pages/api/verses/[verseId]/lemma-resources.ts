import { GetLemmaResourcesResponseBody } from '@translation/api-types';
import createRoute from '../../../../shared/Route';
import { Prisma, client } from '../../../../shared/db';

export default createRoute<{ verseId: string }>()
  .get<void, GetLemmaResourcesResponseBody>({
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
        const data = [];
        for (const word of verse.words) {
          const resources = await client.lemmaResource.findMany({
            where: {
              lemmaId: word.form.lemmaId,
            },
          });
          data.push(
            resources.map((resource) => ({
              resource: resource.resourceCode,
              entry: resource.content,
            }))
          );
        }

        res.ok({ data });
        return;
      }

      res.notFound();
    },
  })
  .build();
