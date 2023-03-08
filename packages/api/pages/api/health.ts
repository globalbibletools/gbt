import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '../../db'

export default async function(req: NextApiRequest, res: NextApiResponse) {
  const collections = await client.db().listCollections().toArray()
  return res.status(200).json({
    status: 'ok',
    collections
  })
}