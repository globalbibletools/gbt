import { PrismaClient, Prisma } from '../prisma/client';
import { randomBytes } from 'crypto';

export { Prisma };
export * as PrismaTypes from '../prisma/client';

export const client = new PrismaClient();

export function ulid() {
  const timestamp = Date.now().toString(16).padStart(12, '0');
  const random = randomBytes(10).toString('hex');
  return `${timestamp}${random}`;
}
