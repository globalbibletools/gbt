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
          COALESCE(nt_counts.code, ot_counts.code) AS code,
          JSON_BUILD_OBJECT(
            'words', COALESCE(ot_counts.word_count, 0),
            'progress', COALESCE(ot_counts.progress, 0)
          ) AS ot,
          JSON_BUILD_OBJECT(
            'words', COALESCE(nt_counts.word_count, 0),
            'progress', COALESCE(nt_counts.progress, 0)
          ) AS nt
        FROM (
          SELECT
            l.code,
            COUNT(1) AS word_count,
            CAST(COUNT(1) AS float) / (
              SELECT CAST(COUNT(1) AS float) FROM "Word" AS w
              JOIN "Verse" AS v ON w."verseId" = v.id
              WHERE v."bookId" <= 39
            ) AS progress
          FROM "Language" AS l
          JOIN "Phrase" AS ph ON ph."languageId" = l.id
          JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          JOIN "Word" AS w ON w.id = phw."wordId"
          JOIN "Verse" AS v ON v.id = w."verseId"
          WHERE ph."deletedAt" IS NULL
            AND g.state = 'APPROVED'
            AND v."bookId" <= 39
          GROUP BY l.id
        ) AS ot_counts
        LEFT JOIN (
          SELECT
            l.code,
            COUNT(1) AS word_count,
            CAST(COUNT(1) AS float) / (
              SELECT CAST(COUNT(1) AS float) FROM "Word" AS w
              JOIN "Verse" AS v ON w."verseId" = v.id
              WHERE v."bookId" >= 40
            ) AS progress
          FROM "Language" AS l
          JOIN "Phrase" AS ph ON ph."languageId" = l.id
          JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          JOIN "Word" AS w ON w.id = phw."wordId"
          JOIN "Verse" AS v ON v.id = w."verseId"
          WHERE ph."deletedAt" IS NULL
            AND g.state = 'APPROVED'
            AND v."bookId" >= 40
          GROUP BY l.id
        ) AS nt_counts ON nt_counts.code = ot_counts.code
      `;
      res.ok({
        data: languages,
      });
    },
  })
  .build();
