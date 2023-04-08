import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../shared/db';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  await client.book.count();
  return res.status(200).json({
    databaseConnection: 'ok',
  });
}
