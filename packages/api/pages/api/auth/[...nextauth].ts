import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { client } from '../../../shared/db';
import { PrismaClient } from '@prisma/client';

if (process.env.VERCEL && process.env.VERCEL_ENV !== 'production') {
  process.env.NEXTAUTH_URL = `https://gloss-translation-git-${process.env.VERCEL_GIT_COMMIT_REF}-${process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN}.vercel.app`;
}

const secureCookieOptions = {
  httpOnly: true,
  // We need same site none cookies for preview URLs because they are on different domains.
  sameSite: process.env.VERCEL_ENV === 'production' ? 'lax' : 'none',
  path: '/',
  secure: true,
};

export default NextAuth({
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
  pages: {
    signIn: `${process.env.NEXTAUTH_URL}/auth/login`,
    signOut: `${process.env.NEXTAUTH_URL}/auth/logout`,
    verifyRequest: `${process.env.NEXTAUTH_URL}/auth/verify-login`,
    error: `${process.env.NEXTAUTH_URL}/auth/error`,
  },
  cookies: process.env.VERCEL
    ? {
        sessionToken: {
          name: `__Secure-next-auth.session-token`,
          options: secureCookieOptions,
        },
        callbackUrl: {
          name: `__Secure-next-auth.callback-url`,
          options: secureCookieOptions,
        },
        csrfToken: {
          name: `__Secure-next-auth.csrf-token`,
          options: secureCookieOptions,
        },
      }
    : undefined,
  callbacks: {
    async redirect({ url }) {
      console.log('REDIRECT', url);
      const baseUrl = process.env.NEXTAUTH_URL ?? '';
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user }) {
      if (!user.email) return '/auth/login';

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
        return '/auth/verify-login';
      }
    },
  },
});
