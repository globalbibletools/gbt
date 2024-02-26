import { GetNextUnapprovedVerse } from '@translation/api-types';
import createRoute from '../../../../../../shared/Route';
import { client } from '../../../../../../shared/db';

type NextUnapprovedVerseResult = [{ nextUnapprovedVerseId: string }];

export default createRoute<{ code: string; verseId: string }>()
  .get<void, GetNextUnapprovedVerse>({
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
        SELECT * FROM "Verse"
          JOIN "Word" ON "Word"."verseId" = "Verse"."id"
          LEFT OUTER JOIN language_gloss ON language_gloss."wordId" = "Word"."id" 
        WHERE (language_gloss."state" = 'UNAPPROVED' 
                OR language_gloss."state" IS NULL)
        ORDER BY "Word"."id" LIMIT 1;
      `;

      res.ok({ verseId: result.nextUnapprovedVerseId });
    },
  })
  .build();
