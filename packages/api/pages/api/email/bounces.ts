import { SNSMessage } from '@translation/api-types';
import * as z from 'zod';
import createRoute from '../../../shared/Route';

export default createRoute()
  .post<SNSMessage, void>({
    schema: z.discriminatedUnion('Type', [
      z.object({
        Type: z.literal('ConfirmSubscription'),
        SubscribeURL: z.string(),
        Token: z.string(),
        TopicArn: z.string(),
      }),
      z.object({
        Type: z.literal('Notification'),
        Message: z.string(),
        TopicArn: z.string(),
      }),
    ]),
    async handler(req, res) {
      console.log(req.body);
      switch (req.body.Type) {
        case 'Notification': {
          console.log('Notification', req.body.Message);
          // TODO: handle bounces
          break;
        }
        case 'ConfirmSubscription': {
          console.log('SNS Confirmation', req.body.SubscribeURL);
          break;
        }
      }

      res.ok();
    },
  })
  .build();
