import * as z from 'zod';
import createRoute from '../../../shared/Route';
import mailer from '../../../shared/mailer';

export default createRoute()
  .post({
    schema: z.object({ email: z.string() }),
    async handler(req, res) {
      mailer.sendEmail({
        subject: '',
        text: 'localhost:4200/update-password',
        html: 'localhost:4200/update-password',
        email: req.body.email,
      });
      return res.ok();
    },
  })
  .build();
