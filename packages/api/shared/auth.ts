import lucia from 'lucia-auth';
import { nextjs } from 'lucia-auth/middleware';
import prisma from '@lucia-auth/adapter-prisma';
import { client, ulid } from './db';
import 'lucia-auth/polyfill/node';
import { CookieOption } from 'lucia-auth/auth/cookie';
import { originAllowlist } from './env';

export const auth = lucia({
  adapter: prisma(client),
  env: process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV',
  middleware: nextjs(),
  origin: originAllowlist,
  generateCustomUserId() {
    return ulid();
  },
  sessionCookie: {
    // Lucia typings don't allow for same site none cookies, but we need them for vercel preview apps.
    sameSite: (process.env.VERCEL_ENV === 'preview'
      ? 'none'
      : 'lax') as CookieOption['sameSite'],
    path: '/',
  },
  transformDatabaseUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  },
});

export type Auth = typeof auth;
