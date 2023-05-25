import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { client } from '../../../shared/db';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { cors } from '../../../shared/cors';

// We need secure cookies in production, but not locally
// because we don't use https locally.
const useSecureCookies = process.env.NODE_ENV === 'production';

const secureCookieOptions = {
  httpOnly: true,
  // We need same site none cookies for preview URLs because they are on different domains.
  sameSite: process.env.VERCEL_ENV === 'preview' ? 'none' : 'lax',
  path: '/',
  secure: useSecureCookies,
};

// In production environments, we add this prefix
const cookiePrefix = process.env.NODE_ENV === 'production' ? '__Secure-' : '';

// The same domains that are permitted for CORS purposes are permitted for callbacks.
const ORIGIN_MATCH = process.env.ORIGIN_MATCH
  ? new RegExp(process.env.ORIGIN_MATCH)
  : undefined;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res);

  return await NextAuth(req, res, {
    // NextAuth doesn't handle the types for prisma clients in custom directories very well.
    adapter: PrismaAdapter(client as unknown as PrismaClient),
    providers: [
      EmailProvider({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
    ],
    session: {
      strategy: 'jwt',
    },
    cookies: {
      sessionToken: {
        name: `${cookiePrefix}next-auth.session-token`,
        options: secureCookieOptions,
      },
      callbackUrl: {
        name: `${cookiePrefix}next-auth.callback-url`,
        options: secureCookieOptions,
      },
      csrfToken: {
        name: `${useSecureCookies ? '__Host' : ''}next-auth.csrf-token`,
        options: secureCookieOptions,
      },
    },
    callbacks: {
      async redirect({ url, baseUrl }) {
        // Allows relative callback URLs
        if (url.startsWith('/')) return `${baseUrl}${url}`;

        // Allows callback URLs on the same origin or that are permitted via CORS settings.
        const origin = new URL(url).origin;
        if (ORIGIN_MATCH?.test(origin) || origin === baseUrl) {
          return url;
        } else {
          return baseUrl;
        }
      },
      async signIn({ user }) {
        if (!user.email) return '/api/auth/login';

        // We want to prevent users who aren't in the system from being able to login.
        const dbUser = await client.user.findUnique({
          where: {
            email: user.email,
          },
        });
        if (dbUser) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.floor(Math.random() * 300))
          );
          return true;
        } else {
          // Since sending the login email takes some time,
          // we don't want potential attackers to be able to use the request time to determine if a user exists or not.
          // To mitigate this, we obfuscate the response time by adding some random delay.
          await new Promise((resolve) =>
            setTimeout(resolve, 1800 + Math.floor(Math.random() * 500))
          );
          // We redirect to the verify login page rather than showing an error message
          // so that an attacker can't determine if the account exists.
          return '/api/auth/verify-request';
        }
      },
    },
  });
}
