import {
  GetLanguageImportResponseBody,
  PostLanguageImportRequestBody,
} from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';
import { client } from '../../../../shared/db';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { NotFoundError } from '../../../../shared/errors';

const sqsClient = new SQSClient({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY ?? '',
  },
});

export default createRoute<{ code: string }>()
  .get<void, GetLanguageImportResponseBody>({
    async handler(req, res) {
      const job = await client.languageImportJob.findFirst({
        where: {
          language: {
            code: req.query.code,
          },
        },
      });

      if (!job) {
        throw new NotFoundError();
      }

      res.ok({
        startDate: job.startDate.toISOString(),
        endDate: job.endDate?.toISOString(),
        succeeded: job.succeeded ?? undefined,
      });
    },
  })
  .post<PostLanguageImportRequestBody, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    schema: z.object({
      import: z.string(),
    }),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });

      // Don't allow importing English glosses. They are already imported from
      // seed data.
      if (!language || language.code == 'en') {
        res.notFound();
        return;
      }

      const currentJob = await client.languageImportJob.findUnique({
        where: {
          languageId: language.id,
        },
      });

      if (currentJob && !currentJob.endDate) {
        return res.conflict([
          {
            code: 'JobAlreadyRunning',
          },
        ]);
      }

      await client.languageImportJob.upsert({
        where: {
          languageId: language.id,
        },
        create: {
          languageId: language.id,
          startDate: new Date(),
        },
        update: {
          startDate: new Date(),
          endDate: null,
          succeeded: null,
        },
      });

      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: process.env.LANGUAGE_IMPORT_QUEUE_URL,
          MessageGroupId: req.query.code,
          MessageBody: JSON.stringify({
            languageCode: req.query.code,
            importLanguage: req.body.import,
          }),
        })
      );

      res.ok();
    },
  })
  .build();
