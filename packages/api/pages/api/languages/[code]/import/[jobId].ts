import { GetLanguageImportResponseBody } from '@translation/api-types';
import createRoute from '../../../../../shared/Route';
import { client } from '../../../../../shared/db';
import { NotFoundError } from '../../../../../shared/errors';

export default createRoute<{ code: string; jobId: string }>()
  .get<void, GetLanguageImportResponseBody>({
    async handler(req, res) {
      const job = await client.languageImportJob.findUnique({
        where: {
          id: req.query.jobId,
        },
        include: {
          language: {
            select: { code: true },
          },
        },
      });

      if (job?.language.code !== req.query.code) {
        throw new NotFoundError();
      }

      res.ok({
        id: job.id,
        startDate: job.startDate.toISOString(),
        endDate: job.endDate?.toISOString(),
        succeeded: job.succeeded ?? undefined,
      });
    },
  })
  .build();
