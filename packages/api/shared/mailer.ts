import { createTransport, SendMailOptions } from 'nodemailer';
import { EmailStatus } from '@translation/db';
import { auth } from './auth';

if (!process.env['EMAIL_SERVER'] && process.env.NODE_ENV === 'production') {
  throw new Error('missing EMAIL_SERVER environment variable');
}

const transporter = process.env['EMAIL_SERVER']
  ? createTransport({
      url: process.env['EMAIL_SERVER'],
    })
  : {
      async sendMail(options: SendMailOptions): Promise<void> {
        console.log(
          `Sending email to ${options.to}:\n${options.text ?? options.html}`
        );
      },
    };

export type EmailOptions = (
  | {
      userId: string;
    }
  | { email: string }
) & {
  subject: string;
  text: string;
  html: string;
};

export class EmailNotVerifiedError extends Error {
  constructor(email: string) {
    super(`We can't send emails to ${email} because it is not verified.`);
  }
}

export class MissingEmailAddressError extends Error {
  constructor(userId: string) {
    super(
      `We can't send emails to user with id ${userId} because they are missing an email address.`
    );
  }
}

export default {
  transporter,
  /**
   * Send a transactional email to a user.
   * @param email - The email to send along with the intended user.
   * @param force - Send to unverified users. Should only be used to send invites.
   * @throws `EmailNotVerifiedError` - If the user's email is not verified or has previously bounced or complained.
   * @throws `MissingEmailAddressError` - If the user does not have an email address.
   */
  async sendEmail(
    { subject, text, html, ...options }: EmailOptions,
    force = false
  ) {
    let email;

    if ('email' in options) {
      email = options.email;
    } else {
      let user, primaryKey;
      try {
        user = await auth.getUser(options.userId);
        const keys = await auth.getAllUserKeys(options.userId);
        primaryKey = keys.find(
          (key) => key.type === 'persistent' && key.primary
        );
      } catch (error) {
        throw new MissingEmailAddressError(options.userId);
      }

      if (!primaryKey) throw new MissingEmailAddressError(options.userId);
      if (user.emailStatus !== EmailStatus.VERIFIED && !force)
        throw new EmailNotVerifiedError(primaryKey?.providerUserId);

      email = primaryKey.providerUserId;
    }

    await this.transporter.sendMail({
      from: process.env['EMAIL_FROM'],
      subject,
      text,
      html,
      to: email,
    });
  },
};
