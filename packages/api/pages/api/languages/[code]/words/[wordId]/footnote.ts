import { PatchWordFootnoteRequestBody } from '@translation/api-types';
import * as z from 'zod';
import createRoute from '../../../../../../shared/Route';
import { authorize } from '../../../../../../shared/access-control/authorize';
import { client } from '../../../../../../shared/db';

export default createRoute<{ code: string; wordId: string }>()
  .patch<PatchWordFootnoteRequestBody, void>({
    schema: z.object({
      note: z.string(),
    }),
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
        res.notFound();
        return;
      } else if (!req.session || !req.session.user) {
        throw Error('No session user.');
      }

      const timestamp = new Date();
      await client.$executeRaw`
        WITH phrase AS (
          SELECT "phraseId", "wordId" FROM "PhraseWord"
          JOIN "Phrase" ON "Phrase".id = "PhraseWord"."phraseId"
          WHERE "PhraseWord"."wordId" = ${req.query.wordId}
            AND "Phrase"."languageId" = ${language.id}::uuid
        ),
        new_phrase AS (
          INSERT INTO "Phrase" ("languageId")
          SELECT ${language.id}::uuid
          WHERE NOT EXISTS (SELECT * FROM phrase)
          RETURNING "id"
        ),
        new_phrase_word AS (
          INSERT INTO "PhraseWord" ("phraseId", "wordId")
          SELECT new_phrase.id, ${req.query.wordId}
          FROM new_phrase
          RETURNING "phraseId", "wordId"
        ),
        upsert_phrase AS (
          (SELECT * FROM phrase) UNION (SELECT * FROM new_phrase_word)
        )
        INSERT INTO "Footnote" ("wordId", "languageId", "phraseId", "content", "authorId", "timestamp")
        SELECT
          ${req.query.wordId},
          ${language.id}::uuid,
          upsert_phrase."phraseId",
          ${req.body.note},
          ${req.session.user.id}::uuid,
          ${timestamp}
        FROM upsert_phrase
        ON CONFLICT ("phraseId") DO UPDATE SET
          "content" = ${req.body.note},
          "authorId" = ${req.session.user.id}::uuid,
          "timestamp" = ${timestamp}
      `;

      res.ok();
    },
  })
  .build();
