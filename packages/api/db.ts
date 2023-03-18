import { MongoClient } from 'mongodb'

const dbUrl = process.env['MONGODB_URI']
if (!dbUrl) {
  throw new Error('MONGODB_URI env var is missing')
}

export const client = new MongoClient(dbUrl)