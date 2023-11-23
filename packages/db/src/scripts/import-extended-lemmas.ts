import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { USFMParser } = require('usfm-grammar');

const LEMMA_ID_REGEX = /\d+(?:\s[a-f])?/;
const STRONGS_REGEX = /\d+[a-f]?/;

const client = new PrismaClient();

async function parseBook(bookId: number, usfmFile: string): Promise<void> {
  const file = readFileSync(
    resolve(__dirname, `../../../../data/morphology/${usfmFile}`)
  ).toString();
  const parser = new USFMParser(file);

  const dbData = await client.word.findMany({
    where: { verse: { bookId } },
    include: {
      form: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
  let dbw = 0;

  const json = parser.toJSON();
  for (let c = 1; c <= json.chapters.length; c++) {
    const chapter = json.chapters[c - 1];
    const verses = chapter.contents.filter((el: any) => 'verseNumber' in el);

    for (let v = 1; v <= verses.length; v++) {
      const verse = verses[v - 1];
      const words = verse.contents
        .flatMap((el: any) =>
          typeof el === 'object' && 'footnote' in el
            ? el.footnote.filter((el: any) => '+w' in el)
            : el
        )
        .filter(
          (el: any) => typeof el === 'object' && ('w' in el || '+w' in el)
        );

      for (let w = 1; w <= words.length; w++) {
        const word = words[w - 1];
        let dbWord = dbData[dbw++];
        // Skip section markers
        if (dbWord.text === 'פ' || dbWord.text === 'ס') {
          dbWord = dbData[dbw++];
        }

        const lemmaId = word.attributes.find(
          (el: any) => 'strong' in el
        )?.strong;
        const cleanedLemmaId = `H${
          STRONGS_REGEX.exec(lemmaId)?.[0] ?? lemmaId
        }`;
        // TODO: figure out how to reconcile words where we've combined 2+ words into a single database entry, and unfolding word has not
        if (cleanedLemmaId.slice(0, 5) !== dbWord.form.lemmaId) {
          console.log(
            dbWord.id,
            word.w[0],
            dbWord.text,
            cleanedLemmaId,
            dbWord.form.lemmaId
          );
        }
      }
    }
  }
}

// parseBook(31, '31-OBA.usfm');
parseBook(1, '01-GEN.usfm');
