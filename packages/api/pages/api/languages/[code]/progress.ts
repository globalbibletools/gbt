import { GetLanguageProgressResponseBody } from '@translation/api-types';
import { client } from '../../../../shared/db';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';

export default createRoute<{ code: string }>()
  .get<void, GetLanguageProgressResponseBody>({
    authorize: authorize((req) => ({
      action: 'read',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    async handler(req, res) {
      const language = await client.language.findUnique({
        where: {
          code: req.query.code,
        },
      });

      if (!language) {
        res.notFound();
        return;
      }

      const data = await client.$queryRaw<
        { name: string; wordCount: bigint; approvedCount: bigint }[]
      >`
        SELECT b.name, COUNT(*) AS "wordCount", COUNT(*) FILTER (WHERE ph."wordId" IS NOT NULL) AS "approvedCount" FROM "Book" AS b
        JOIN "Verse" AS v ON v."bookId" = b.id
        JOIN "Word" AS w ON w."verseId" = v.id
        LEFT JOIN (
          SELECT phw."wordId" FROM "PhraseWord" AS phw
          JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          WHERE ph."languageId" = ${language.id}::uuid
            AND g.state = 'APPROVED'
        ) AS ph ON ph."wordId" = w.id
        GROUP BY b.id
        ORDER BY b.id
      `;

      res.ok({
        data: data.map((book) => ({
          name: book.name,
          wordCount: Number(book.wordCount),
          approvedCount: Number(book.approvedCount),
        })),
      });
    },
  })
  .build();
