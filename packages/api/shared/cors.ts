import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

const origin = process.env.ORIGIN_MATCH
  ? new RegExp(process.env.ORIGIN_MATCH)
  : '*';

export async function cors(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    origin,
    credentials: true,
  });
}
