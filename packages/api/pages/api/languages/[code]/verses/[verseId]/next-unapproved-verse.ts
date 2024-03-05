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
        SELECT "Word"."verseId" as "nextUnapprovedVerseId"
          FROM "Word" 
          LEFT OUTER JOIN "Gloss" ON "Gloss"."wordId" = "Word"."id" 
            AND "Gloss"."languageId" = ${language.id}::uuid
        WHERE "Word"."verseId" > ${req.query.verseId} 
          AND ("Gloss"."state" = 'UNAPPROVED' OR "Gloss"."state" IS NULL)
        ORDER BY "Word"."id" LIMIT 1;
      `;

      res.ok({ verseId: result.nextUnapprovedVerseId });
    },
  })
  .build();
