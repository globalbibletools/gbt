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

  let dbData = await client.word.findMany({
    where: { verse: { bookId } },
    include: {
      form: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
  dbData = dbData
    .filter(
      (row) => row.text !== 'פ' && row.text !== 'ס' && !row.text.startsWith('(')
    )
    .flatMap((row) =>
      row.text
        .split('־')
        .filter((text) => !!text)
        .map((text, i, list) => ({
          ...row,
          text: `${text}${i + 1 < list.length ? '־' : ''}`,
        }))
    )
    .flatMap((row) =>
      row.text
        .replace(' ׀', '')
        .split(' ')
        .filter((text) => !!text)
        .map((text) => ({ ...row, text }))
    );
  let dbw = 0;

  const unique = new Set<string>();

  const json = parser.toJSON();
  for (let c = 1; c <= json.chapters.length; c++) {
    const chapter = json.chapters[c - 1];
    const verses = chapter.contents.filter((el: any) => 'verseNumber' in el);

    for (let v = 1; v <= verses.length; v++) {
      const verse = verses[v - 1];
      const words = verse.contents.filter(
        (el: any) => typeof el === 'object' && 'w' in el
      );

      for (let w = 1; w <= words.length; w++) {
        const word = words[w - 1];
        const dbWord = dbData[dbw++];

        const lemmaId = word.attributes.find(
          (el: any) => 'strong' in el
        )?.strong;
        const cleanedLemmaId = `H${
          STRONGS_REGEX.exec(lemmaId)?.[0] ?? lemmaId
        }`;
        if (
          cleanedLemmaId.slice(0, 5) !== dbWord.form.lemmaId &&
          dbWord.form.lemmaId !== 'H????'
        ) {
          unique.add(`${cleanedLemmaId}-${dbWord.form.lemmaId}`);
          console.log(
            dbWord.id,
            word.w?.[0],
            dbWord.text,
            cleanedLemmaId,
            dbWord.form.lemmaId,
            cleanedLemmaId.slice(0, 5) !== dbWord.form.lemmaId
          );
        }
      }
    }
  }

  console.log(unique);
}

// parseBook(31, '31-OBA.usfm');
parseBook(2, '02-EXO.usfm').catch(console.error);
