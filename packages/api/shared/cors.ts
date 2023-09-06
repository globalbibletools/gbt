import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { originAllowlist } from './env';

export async function cors(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    origin: originAllowlist,
    credentials: true,
    exposedHeaders: ['Location'],
  });
}
