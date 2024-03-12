import { Lucia } from 'lucia';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { client, PrismaTypes } from './db';

import { webcrypto } from 'node:crypto';
(globalThis.crypto as any) = webcrypto;

export const auth = new Lucia(new PrismaAdapter(client.session, client.user), {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes(attributes) {
    return {
      email: attributes.email,
      name: attributes.name,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof auth;
    DatabaseUserAttributes: {
      email: string;
      name: string;
      emailStatus: PrismaTypes.EmailStatus;
    };
  }
}
