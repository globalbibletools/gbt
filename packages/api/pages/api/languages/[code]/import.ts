import { StartLanguageImportStatusRequestBody } from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';
import { client } from '../../../../shared/db';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.SECRET_ACCESS_KEY ?? '',
  },
});

export default createRoute()
  .post<StartLanguageImportStatusRequestBody, void>({
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

      const job = await client.languageImportJob.create({
        data: {
          languageId: language.id,
          startDate: new Date(),
        },
      });

      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: process.env.LANGUAGE_IMPORT_QUEUE_URL,
          MessageGroupId: req.query.code,
          MessageBody: JSON.stringify({
            languageCode: req.query.code,
            importLanguage: req.body.import,
            jobId: job.id,
          }),
        })
      );

      res.ok();
    },
  })
  .get<void, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    async handler(req, res) {
      // TODO: query DB for import status

      res.ok();
    },
  })
  .build();
