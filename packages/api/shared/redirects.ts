import { redirectOrigin } from './env';

export const redirects = {
  invite: (token: string) => `${redirectOrigin}/invite?token=${token}`,
  emailVerification: (token: string) =>
    `${redirectOrigin}/verify-email?token=${token}`,
};
