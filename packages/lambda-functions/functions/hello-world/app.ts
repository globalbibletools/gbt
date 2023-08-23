import { PrismaClient } from '@translation/db';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { bookKeys } from '../../../../data/book-keys';

const client = new PrismaClient();

const importServer = 'https://hebrewgreekbible.online';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log(event.queryStringParameters);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Wow it actually works!',
    }),
  };

  const languageCode = 'ar'; // TODO: read language code from request
  const importLanguage = 'Arabic'; // TODO: read import language from request

  const language = await client.language.findUnique({
    where: {
      code: languageCode,
    },
  });

  // Delete all the glosses for the language.
  await client.gloss.deleteMany({
    where: {
      languageId: language.id,
    },
  });

  const glossData: { wordId; gloss }[] = [];
  for (const key of bookKeys) {
    const bookId = bookKeys.indexOf(key) + 1;
    const glossUrl = `${importServer}/${importLanguage}Glosses/${key}Gloss.js`;
    const bookData = await fetchGlossData(glossUrl);
    const referenceUrl = `${importServer}/files/${key}.js`;
    const referenceData = await fetchGlossData(referenceUrl);

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
            referenceData[chapterNumber - 1][verseNumber - 1][wordIndex]
              .length == 6;
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
};

/**
 * Fetch gloss data from a remote JS file.
 */
async function fetchGlossData(url: string) {
  const response = await fetch(url);
  const jsCode = await response.text();
  return parseGlossJs(jsCode);
}

/**
 * Parse JSON data from the JS gloss scripts.
 */
function parseGlossJs(jsCode: string) {
  // Look for lines that start with var.
  const varLines = jsCode.split('\n').filter((line) => line.startsWith('var '));
  // If there are multiple var declarations, keep only the first one.
  if (varLines.length > 1) {
    jsCode = jsCode.substring(0, jsCode.indexOf(varLines[1]));
  }
  // Remove the var prefix.
  jsCode = jsCode.replace(/var \w+=/gm, '');
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
