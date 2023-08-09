const baseUrl = process.env['REDIRECT_ORIGIN'];

export const redirects = {
  invite: (token: string) => `${baseUrl}/invite?token=${token}`,
  emailVerification: (token: string) =>
    `${baseUrl}/verify-email?token=${token}`,
};
