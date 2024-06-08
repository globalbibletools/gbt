import { GlossState, GlossSource, PrismaClient } from '@translation/db';
import { SQSEvent } from 'aws-lambda';
import { bookKeys } from '../../../../data/book-keys';

const client = new PrismaClient();

const importServer = 'https://hebrewgreekbible.online';

export const lambdaHandler = async (event: SQSEvent) => {
  try {
    const { languageCode, importLanguage } = JSON.parse(
      event.Records[0].body
    ) as {
      languageCode: string;
      importLanguage: string;
    };

    console.log(`Import ${importLanguage} to ${languageCode} ... start`);

    const language = await client.language.findUnique({
      where: {
        code: languageCode,
      },
    });

    if (language) {
      const job = await client.languageImportJob.findUnique({
        where: { languageId: language.id },
      });

      // Delete all the glosses for the language.
      console.log(`deleting existing phrases... start`);
      await client.$executeRaw`
        UPDATE "Phrase"
          SET
            "deletedAt" = now()
            "deletedBy" = ${job?.userId}::uuid
        WHERE "languageId" = ${language.id}::uuid
          AND "deletedAt" IS NULL
      `;
      console.log(`deleting existing phrases ... complete`);

      for (const key of bookKeys) {
        try {
          console.log(`${key} ... start`);

          const bookId = bookKeys.indexOf(key) + 1;
          const glossUrl = `${importServer}/${importLanguage}Glosses/${key}Gloss.js`;
          const bookData = await fetchGlossData(glossUrl);

          const glossData: {
            wordId: string;
            gloss: string;
            phraseId: number;
          }[] = [];

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
              for (
                let wordIndex = 0;
                wordIndex < verseData.length;
                wordIndex++
              ) {
                wordNumber += 1;
                const wordId = [
                  bookId.toString().padStart(2, '0'),
                  chapterNumber.toString().padStart(3, '0'),
                  verseNumber.toString().padStart(3, '0'),
                  wordNumber.toString().padStart(2, '0'),
                ].join('');
                const gloss = verseData[wordIndex][0];
                glossData.push({ wordId, gloss, phraseId: 0 });
              }
            }
          }
          console.log(`${key} ... complete`);

          const phrases = await client.$queryRaw<{ id: number }[]>`
            INSERT INTO "Phrase" ("languageId", "createdAt", "createdBy")
            SELECT ${language.id}::uuid, now(), ${job?.userId}::uuid FROM generate_series(1,${glossData.length})
            RETURNING id
          `;
          for (const i in glossData) {
            glossData[i].phraseId = phrases[i].id;
          }

          await client.phraseWord.createMany({
            data: glossData.map((word) => ({
              wordId: word.wordId,
              phraseId: word.phraseId,
            })),
          });

          await client.gloss.createMany({
            data: glossData.map((word) => ({
              wordId: word.wordId,
              languageId: language.id,
              gloss: word.gloss,
              phraseId: word.phraseId,
              state: GlossState.APPROVED,
            })),
          });
          await client.glossHistoryEntry.createMany({
            data: glossData.map(({ wordId, gloss }) => ({
              wordId,
              languageId: language.id,
              userId: job?.userId,
              gloss,
              state: GlossState.APPROVED,
              source: GlossSource.IMPORT,
            })),
          });
        } catch (error) {
          console.log(error);
        }
      }

      await client.languageImportJob.update({
        where: {
          languageId: language.id,
        },
        data: {
          endDate: new Date(),
          succeeded: true,
        },
      });
    }

    console.log(`Import ${importLanguage} to ${languageCode} ... complete`);
    return {};
  } catch (error) {
    console.log(error);
    return {};
  }
};

/**
 * Fetch gloss data from a remote JS file.
 */
async function fetchGlossData(url: string) {
  const response = await fetch(url);
  const jsCode = await response.text();
  return parseGlossJs(jsCode.trim());
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
