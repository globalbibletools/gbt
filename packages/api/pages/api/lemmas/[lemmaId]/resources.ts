import { GetLemmaResourcesResponseBody } from '@translation/api-types';
import createRoute from '../../../../shared/Route';
import { client } from '../../../../shared/db';

export default createRoute<{ lemmaId: string }>()
  .get<void, GetLemmaResourcesResponseBody>({
    async handler(req, res) {
      const lemma = await client.lemma.findUnique({
        where: {
          id: req.query.lemmaId,
        },
      });

      if (lemma) {
        const resources = await client.lemmaResource.findMany({
          where: {
            lemmaId: req.query.lemmaId,
          },
        });

        res.ok({
          data: resources.map((resource) => ({
            resource: resource.resourceCode,
            entry: resource.content,
          })),
        });
        return;
      }

      res.notFound();
    },
  })
  .build();
