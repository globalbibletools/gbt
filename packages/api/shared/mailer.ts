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
      /** The user to send the email to. The email will not be sent unless the user's email is verified. */
      userId: string;
    }
  | {
      /** The email address to send to. This bypasses all email verification checks, so use with caution. */
      email: string;
    }
) & {
  /** The subject line of the email. */
  subject: string;
  /** The text of the message for email clients that don't support HTML. */
  text: string;
  /** The email message formatted as HTML. */
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
   * If a `userId` is given, this will confirm the user's email address is active before sending the message.
   * Otherwise if `email` is given, this verification will be bypassed.
   * @param email - The email to send along with the intended user.
   * @throws `EmailNotVerifiedError` - If the user's email is not verified or has previously bounced or complained.
   * @throws `MissingEmailAddressError` - If the user does not have an email address.
   */
  async sendEmail({ subject, text, html, ...options }: EmailOptions) {
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
      if (user.emailStatus !== EmailStatus.VERIFIED)
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
