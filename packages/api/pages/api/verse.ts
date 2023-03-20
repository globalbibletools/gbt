import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '../../db'

export default async function(req: NextApiRequest, res: NextApiResponse) {
  const verse = await client.verse.findFirst({
    where: {
      number: 1,
      chapter: {
        number: 1,
        book: {
          search: 'matthew'
        },
      } 
    },
    select: {
      number: true,
      chapter: {
        select: {
          number: true,
          book: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  if (verse) {
    res.status(200).json({
      book: verse.chapter.book.name,
      chapter: verse.chapter.number,
      verse: verse.number
    })
  } else {
    res.status(404)
  }
}