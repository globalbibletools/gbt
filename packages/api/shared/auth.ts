import lucia from 'lucia-auth';
import { nextjs } from 'lucia-auth/middleware';
import prisma from '@lucia-auth/adapter-prisma';
import { client, ulid } from './db';
import 'lucia-auth/polyfill/node';

export const auth = lucia({
  adapter: prisma(client),
  env: process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV',
  middleware: nextjs(),
  // TODO: extract to env vars
  origin: ['http://localhost:4300', 'http://localhost:4200'],
  generateCustomUserId() {
    return ulid();
  },
});

export type Auth = typeof auth;
