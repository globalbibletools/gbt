import { SNSMessage } from '@translation/api-types';
import * as z from 'zod';
import createRoute from '../../../shared/Route';

const messageSchema = z.discriminatedUnion('notificationType', [
  z.object({
    notificationType: z.literal('Bounce'),
    bounce: z.object({
      bounceType: z.enum(['Undetermined', 'Permanent', 'Transient']),
      bouncedRecipients: z.array(z.object({ emailAddress: z.string() })),
    }),
  }),
  z.object({
    notificationType: z.literal('Complaint'),
    complaint: z.object({
      complainedRecepients: z.array(z.object({ emailAddress: z.string() })),
    }),
  }),
  z.object({
    notificationType: z.literal('Delivery'),
    delivery: z.object({}),
  }),
]);

export default createRoute()
  .post<SNSMessage, void>({
    schema: z.discriminatedUnion('Type', [
      z.object({
        Type: z.literal('SubscriptionConfirmation'),
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
      switch (req.body.Type) {
        case 'Notification': {
          console.log(req.body.Message);
          const parseResult = messageSchema.safeParse(req.body.Message);
          if (parseResult.success) {
            const message = parseResult.data;
            switch (message.notificationType) {
              case 'Bounce': {
                const emails = message.bounce.bouncedRecipients.map(
                  (r) => r.emailAddress
                );
                console.log(`Email bounced: ${emails.join(',')}`);

                // TODO: mark as bounced

                break;
              }
              case 'Complaint': {
                const emails = message.complaint.complainedRecepients.map(
                  (r) => r.emailAddress
                );
                console.log(`Email complaint: ${emails.join(',')}`);

                // TODO: mark as complained

                break;
              }
            }
          }
          break;
        }
        case 'SubscriptionConfirmation': {
          console.log('SNS Confirmation', req.body.SubscribeURL);
          break;
        }
      }

      res.ok();
    },
  })
  .build();
