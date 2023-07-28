import {
  PostLanguageImportRequestBody,
  bookKeys,
} from '@translation/api-types';
import { z } from 'zod';
import createRoute from '../../../../shared/Route';
import { authorize } from '../../../../shared/access-control/authorize';
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
      // TODO: we only use a few book keys for testing, to avoid creating a
      //       ton of requests. use all keys when things are working
      // for (const key of bookKeys) {
      for (const key of ['Gen', '1Ch']) {
        const importUrl = `${importServer}/${req.body.import}Glosses/${key}Gloss.js`;
        const response = await fetch(importUrl);
        const jsCode = await response.text();
        const glossArray = parseGlossJs(jsCode);
        console.log(glossArray.length);
      }
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
