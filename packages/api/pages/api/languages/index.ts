import { NextApiRequest, NextApiResponse } from 'next';

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    data: null,
  });
}
