import { PostLanguageImportRequestBody } from '@translation/api-types';
import { z } from 'zod';
import { bookKeys } from '../../../../../../data/book-keys';
import { morphologyData } from '../../../../../../data/morphology';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';
import { client } from '../../../../shared/db';
import { importServer } from '../../../../shared/env';

export default createRoute()
  .post<PostLanguageImportRequestBody, void>({
    authorize: authorize((req) => ({
      action: 'administer',
      subject: 'Language',
      subjectId: req.query.code,
    })),
    schema: z.object({
      import: z.string(),
    }),
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

      // Delete all the glosses for the language.
      await client.gloss.deleteMany({
        where: {
          languageId: language.id,
        },
      });

      const glossData = [];

      for (const key of bookKeys) {
        const importUrl = `${importServer}/${req.body.import}Glosses/${key}Gloss.js`;
        const response = await fetch(importUrl);
        const jsCode = await response.text();
        const bookData = parseGlossJs(jsCode);
        const bookId = bookKeys.indexOf(key) + 1;
        // Accumulate gloss data
        for (
          let chapterNumber = 1;
          chapterNumber <= bookData.length;
          chapterNumber++
        ) {
          const chapterData = bookData[chapterNumber - 1];
          for (
            let verseNumber = 1;
            verseNumber <= chapterData.length;
            verseNumber++
          ) {
            const verseData = chapterData[verseNumber - 1];
            let wordNumber = 0;
            for (let wordIndex = 0; wordIndex < verseData.length; wordIndex++) {
              const useWord =
                morphologyData[key][chapterNumber - 1][verseNumber - 1][
                  wordIndex
                ].length == 6;
              if (useWord) {
                wordNumber += 1;
                const wordId = [
                  bookId.toString().padStart(2, '0'),
                  chapterNumber.toString().padStart(3, '0'),
                  verseNumber.toString().padStart(3, '0'),
                  wordNumber.toString().padStart(2, '0'),
                ].join('');
                const gloss = verseData[wordIndex][0];
                glossData.push({ wordId, gloss });
              }
            }
          }
        }
      }
      await client.gloss.createMany({
        data: glossData.map(({ wordId, gloss }) => ({
          wordId,
          languageId: language.id,
          gloss,
        })),
      });
      res.ok();
    },
  })
  .build();

/**
 * Parse JSON data from the JS gloss scripts.
 */
function parseGlossJs(jsCode: string) {
  // Remove the var prefix.
  jsCode = jsCode.replace('var gloss=', '');
  // Remove the comments and the final semicolon.
  jsCode = jsCode.replace(/\/\/.*|;$/gm, '');
  // Remove trailing commas.
  // Simplified from https://github.com/nokazn/strip-json-trailing-commas/blob/beced788eb7c35d8b5d26b368dff295455a0aef4/src/index.ts#L21
  jsCode = jsCode.replace(/(?<=(["\]])\s*),(?=\s*[\]])/g, '');
  // Parse JSON
  return JSON.parse(jsCode);
}
// For future unit testing:
//     Test input: `var gloss=[[["test", "item; item 2; item 3", "var gloss=test", ";", ], ], ];`
//     Expected output: [ [ [ 'test', 'item; item 2; item 3', 'var gloss=test', ';' ] ] ]
