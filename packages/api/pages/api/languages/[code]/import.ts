import {
  PostLanguageImportRequestBody,
  bookKeys,
} from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';
import { importServer } from '../../../../shared/env';
import { client } from '../../../../shared/db';

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

      // TODO: we only use a few book keys for testing, to avoid creating a
      //       ton of requests. use all keys when things are working
      // for (const key of bookKeys) {
      for (const key of ['Gen', '1Ch']) {
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
            for (
              let wordNumber = 1;
              wordNumber <= verseData.length;
              wordNumber++
            ) {
              const wordId = [
                bookId.toString().padStart(2, '0'),
                chapterNumber.toString().padStart(3, '0'),
                verseNumber.toString().padStart(3, '0'),
                // TODO: the +1 is just to work around a current bug
                (wordNumber + 1).toString().padStart(2, '0'),
              ].join('');
              console.log(wordId);
              const gloss = verseData[wordNumber - 1][0];
              glossData.push({ wordId, gloss });
              console.log(gloss);
              // TODO: handle situation where the gloss data has extra words.
              await client.gloss.create({
                data: {
                  wordId,
                  languageId: language.id,
                  gloss,
                },
              });
            }
          }
        }
      }

      // Actually insert all the glosses.
      // const result = await client.gloss.createMany({
      //   data: glossData.map(({ wordId, gloss }) => ({
      //     wordId,
      //     languageId: language.id,
      //     gloss,
      //   })),
      // });
      // console.log('Number of glosses imported:', result.count);

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
