import {
  GetLanguagesProgressResponseBody,
  LanguageProgress,
} from '@translation/api-types';
import { client } from '../../../shared/db';
import createRoute from '../../../shared/Route';

export default createRoute()
  .get<void, GetLanguagesProgressResponseBody>({
    async handler(req, res) {
      const languages = await client.$queryRaw<LanguageProgress[]>`
        SELECT
          l.code,
          CAST(COUNT(1) AS float) / (SELECT CAST(COUNT(1) AS float) FROM "Word") AS progress
        FROM "Language" AS l
        JOIN "Phrase" AS ph ON ph."languageId" = l.id
        JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
        JOIN "Gloss" AS g ON g."phraseId" = ph.id
        WHERE ph."deletedAt" IS NULL
        AND g.state = 'APPROVED'
        GROUP BY l.id
      `;
      res.ok({
        data: languages,
      });
    },
  })
  .build();
