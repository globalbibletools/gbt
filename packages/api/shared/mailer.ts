import { createTransport, SendMailOptions } from 'nodemailer';

const transporter = createTransport({
  url: process.env['EMAIL_SERVER'],
});

export default {
  transporter,
  async sendEmail(email: SendMailOptions) {
    // TODO: handle email verification
    const response = await this.transporter.sendMail({
      from: process.env['FROM_EMAIL'],
      ...email,
    });
  },
};
