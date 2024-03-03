import { GetNextUnapprovedVerse } from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { client } from '../../../../../../shared/db';
import { authorize } from '../../../../../../shared/access-control/authorize';

type NextUnapprovedVerseResult = [{ nextUnapprovedVerseId: string }];

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetNextUnapprovedVerse>({
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
        WITH language_gloss as 
          (SELECT * FROM "Gloss" 
            WHERE "Gloss"."languageId" = ${language.id}::uuid)
        SELECT "Word"."verseId" as "nextUnapprovedVerseId"
          FROM "Word" 
          LEFT OUTER JOIN language_gloss ON language_gloss."wordId" = "Word"."id" 
        WHERE "Word"."verseId" > ${req.query.verseId} AND language_gloss <> 'APPROVED'
        ORDER BY "Word"."id" LIMIT 1;
      `;

      res.ok({ verseId: result.nextUnapprovedVerseId });
    },
  })
  .build();
