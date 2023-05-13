import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { client } from '../../../shared/db';
import { PrismaClient } from '@prisma/client';

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
    signIn: '/auth/login',
    signOut: '/auth/logout',
    verifyRequest: '/auth/verify-login',
    error: '/auth/error',
  },
  callbacks: {
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
