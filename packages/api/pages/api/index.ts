import { NextApiRequest, NextApiResponse } from 'next'

export default function(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({ status: 'ok' })
}