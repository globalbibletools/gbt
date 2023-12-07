import {
  GetLemmaResourcesResponseBody,
  Resource,
} from '@translation/api-types';
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
        const data: Record<string, Resource[]> = {};
        const lemmaIds = new Set(verse.words.map((w) => w.form.lemmaId));

        for (const lemmaId of lemmaIds) {
          const resources = await client.lemmaResource.findMany({
            where: { lemmaId },
          });
          data[lemmaId] = resources.map((resource) => ({
            resource: resource.resourceCode,
            entry: resource.content,
          }));
        }

        res.ok({ data });
        return;
      }

      res.notFound();
    },
  })
  .build();
