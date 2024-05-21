import { GetVerseResponseBody } from '@translation/api-types';
import createRoute from '../../../shared/Route';
import { client } from '../../../shared/db';

interface VerseWord {
  id: string;
  text: string;
  formId: string;
  lemmaId: string;
  grammar: string;
  referenceGloss?: string;
}

export default createRoute<{ verseId: string }>()
  .get<void, GetVerseResponseBody>({
    async handler(req, res) {
      const words = await client.$queryRaw<VerseWord[]>`
        SELECT w.id, w.text, w."formId", lf."lemmaId", lf.grammar, g.gloss AS "referenceGloss" FROM "Word" AS w
        JOIN "LemmaForm" AS lf ON lf.id = w."formId"
        LEFT JOIN (
          SELECT phw."wordId", g.gloss FROM "Phrase" AS ph
          JOIN "Language" AS l ON l.id = ph."languageId"
          JOIN "PhraseWord" AS phw ON phw."phraseId" = ph.id
          JOIN "Gloss" AS g ON g."phraseId" = ph.id
          WHERE l.code = 'eng'
        ) AS g ON g."wordId" = w.id
        WHERE w."verseId" = ${req.query.verseId}
      `;

      if (words.length === 0) {
        res.notFound();
        return;
      }

      res.ok({
        data: {
          id: req.query.verseId,
          words,
        },
      });
    },
  })
  .build();
