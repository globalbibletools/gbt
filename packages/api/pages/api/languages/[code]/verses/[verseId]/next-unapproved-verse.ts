import { GetNextUnapprovedVerseResponseBody } from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { client } from '../../../../../../shared/db';
import { authorize } from '../../../../../../shared/access-control/authorize';

type NextUnapprovedVerseResult = [{ nextUnapprovedVerseId: string }];

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetNextUnapprovedVerseResponseBody>({
    authorize: authorize((req) => ({
      action: 'translate',
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
        return res.notFound();
      }

      const [result] = await client.$queryRaw<NextUnapprovedVerseResult>`
        SELECT w."verseId" as "nextUnapprovedVerseId"
        FROM "Word" AS w
        LEFT JOIN LATERAL (
          SELECT FROM "PhraseWord" AS phw
          JOIN "Phrase" AS ph ON ph.id = phw."phraseId"
            AND ph."languageId" = ${language.id}::uuid
          LEFT JOIN "Gloss" AS g ON g."phraseId" = ph.id
            AND (g."state" = 'UNAPPROVED' OR g."state" IS NULL)
          WHERE phw."wordId" = w.id
        ) AS g ON true
        WHERE w."verseId" > ${req.query.verseId}
        ORDER BY w."id"
        LIMIT 1
      `;

      res.ok({ nextUnapprovedVerseId: result.nextUnapprovedVerseId });
    },
  })
  .build();
