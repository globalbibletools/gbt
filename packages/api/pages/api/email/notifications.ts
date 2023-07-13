import { SNSMessage } from '@translation/api-types';
import { EmailStatus } from '../../../prisma/client';
import { auth } from '../../../shared/auth';
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
      complainedRecipients: z.array(z.object({ emailAddress: z.string() })),
    }),
  }),
  z.object({
    notificationType: z.literal('Delivery'),
    delivery: z.object({}),
  }),
]);

// This route exists to receive notifications from AWS that an email bounced or was complained about.
// In these situations, we remove the validated email status from the user so they no longer receive email from us.
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
          const parseResult = messageSchema.safeParse(
            JSON.parse(req.body.Message)
          );
          if (parseResult.success) {
            const message = parseResult.data;
            switch (message.notificationType) {
              case 'Bounce': {
                if (message.bounce.bounceType === 'Permanent') {
                  await Promise.all(
                    message.bounce.bouncedRecipients.map(
                      async ({ emailAddress }) => {
                        try {
                          console.log(`Email bounced: ${emailAddress}`);
                          const key = await auth.getKey(
                            'username',
                            emailAddress
                          );
                          await auth.updateUserAttributes(key.userId, {
                            emailStatus: EmailStatus.BOUNCED,
                          });
                        } catch {
                          // If a user doesn't exist, continue.
                        }
                      }
                    )
                  );
                }
                break;
              }
              case 'Complaint': {
                await Promise.all(
                  message.complaint.complainedRecipients.map(
                    async ({ emailAddress }) => {
                      try {
                        console.log(`Email complaint: ${emailAddress}`);
                        const key = await auth.getKey('username', emailAddress);
                        await auth.updateUserAttributes(key.userId, {
                          emailStatus: EmailStatus.COMPLAINED,
                        });
                      } catch {
                        // If a user doesn't exist, continue.
                      }
                    }
                  )
                );
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
