import { createTransport } from 'nodemailer';
import { EmailStatus } from '../prisma/client';
import { auth } from './auth';

const transporter = createTransport({
  url: process.env['EMAIL_SERVER'],
});

export interface EmailOptions {
  userId: string;
  subject: string;
  text: string;
}

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
  async sendEmail({ userId, subject, text }: EmailOptions, force = false) {
    let user, primaryKey;
    try {
      user = await auth.getUser(userId);
      const keys = await auth.getAllUserKeys(userId);
      primaryKey = keys.find((key) => key.type === 'persistent' && key.primary);
    } catch (error) {
      throw new MissingEmailAddressError(userId);
    }

    if (!primaryKey) throw new MissingEmailAddressError(userId);
    if (user.emailStatus !== EmailStatus.VERIFIED && !force)
      throw new EmailNotVerifiedError(primaryKey?.providerUserId);

    const email = primaryKey.providerUserId;

    await this.transporter.sendMail({
      from: process.env['EMAIL_FROM'],
      subject,
      text,
      to:
        process.env.NODE_ENV === 'production'
          ? email
          : process.env.TEST_EMAIL ?? email,
    });
  },
};
