import createRoute from '../../../shared/Route';

export default createRoute()
  .post<void, void>({
    async handler(req, res) {
      const messageType = req.headers['x-amz-sns-message-type'];
      switch (messageType) {
        case 'Notification': {
          console.log('Notification', req.body);
          break;
        }
        case 'SubscriptionConfirmation': {
          console.log('SNS Confirmation', req.body);
          break;
        }
        default:
          throw new Error(`unknown message type: ${messageType}`);
      }

      res.ok();
    },
  })
  .build();
