import { readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient, Word } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { USFMParser } = require('usfm-grammar');

const LEMMA_ID_REGEX = /\d+(?:\s[a-f])?/;
const STRONGS_REGEX = /\d+[a-f]?/;
const SPACE_REGEX = / (?!׀)/;
const MAQEF_REGEX = /־(?!$)/;

const client = new PrismaClient();

const unique = new Map<string, string[]>();

async function parseBook(bookId: number, usfmFile: string): Promise<void> {
  const file = readFileSync(
    resolve(__dirname, `../../../../data/morphology/${usfmFile}`)
  ).toString();
  const parser = new USFMParser(file);

  const dbData = await fetchDbBook(bookId);
  let dbw = 0;

  const json = parser.toJSON();
  for (let c = 1; c <= json.chapters.length; c++) {
    const chapter = json.chapters[c - 1];
    const verses = chapter.contents.filter((el: any) => 'verseNumber' in el);

    for (let v = 1; v <= verses.length; v++) {
      const verse = verses[v - 1];

      for (let e = 0; e < verse.contents.length; e++) {
        const el = verse.contents[e];

        const refWord = findWord(el);
        if (!refWord) {
          continue;
        }

        while (skipUnknown(verse.contents[e + 1])) {
          e += 1;
        }

        const footnote = findFootnote(verse.contents[e + 1]);

        let dbWord = dbData[dbw++];

        // Genesis 30:11 and Exodus 4:2 have two quere words missing.
        if (dbWord.id === '0200400205' || dbWord.id === '0103001104') {
          dbw += 1;
          dbWord = dbData[dbw++];
        }
        // Ruth 3:12 word 5 has a ketiv with an empty quere, so unfolding word does not have a word here.
        // if (dbWord.id === '0800301205') {
        //   dbWord = dbData[dbw++];
        // }

        if (footnote) {
          e += 1;

          const refQuere = footnote.type === 'Q' ? footnote : refWord;
          const refKetiv = footnote.type === 'K' ? footnote : refWord;

          const otherDbWord = dbData[dbw].text.match(/(\(|\[)/)
            ? dbData[dbw++]
            : undefined;
          const dbQuere = dbWord.text.includes('(') ? dbWord : otherDbWord;
          const dbKetiv = dbWord.text.includes('[') ? dbWord : otherDbWord;

          console.log(dbWord, otherDbWord);

          compareWord(
            dbKetiv
              ? {
                  wordId: dbKetiv.id,
                  lemmaId: dbKetiv.form.lemmaId,
                  text: dbKetiv.text,
                }
              : undefined,
            refKetiv
          );
          compareWord(
            dbQuere
              ? {
                  wordId: dbQuere.id,
                  lemmaId: dbQuere.form.lemmaId,
                  text: dbQuere.text,
                }
              : undefined,
            refQuere
          );
        } else {
          compareWord(
            {
              wordId: dbWord.id,
              lemmaId: dbWord.form.lemmaId,
              text: dbWord.text,
            },
            refWord
          );
        }
      }
    }
  }
}

interface DbWordToCompare {
  wordId: string;
  lemmaId: string;
  text: string;
}

interface RefWordToCompare {
  lemmaId: string;
  text: string;
}

async function fetchDbBook(bookId: number) {
  const dbData = await client.word.findMany({
    where: { verse: { bookId } },
    include: {
      form: true,
    },
    orderBy: {
      id: 'asc',
    },
  });
  return dbData
    .filter(
      (row) => row.text !== 'פ' && row.text !== 'ס' && row.text !== '‪‬׆ס'
    )
    .flatMap((row) => {
      if (row.text.includes('(') || row.text.includes('[')) {
        return row;
      } else {
        return row.text.split(MAQEF_REGEX).map((text, i, list) => ({
          ...row,
          text: `${text}${i + 1 < list.length ? '־' : ''}`,
        }));
      }
    })
    .flatMap((row) => {
      if (row.text.includes('(') || row.text.includes('[')) {
        return row;
      } else {
        return row.text.split(SPACE_REGEX).map((text) => ({ ...row, text }));
      }
    });
}

function findFootnote(el: any) {
  if (typeof el === 'object' && 'footnote' in el) {
    const lemmaId = el.footnote
      .find((el: any) => 'attributes' in el)
      .attributes.find((el: any) => 'strong' in el)?.strong;
    return {
      type: el.footnote.find((el: any) => 'ft' in el).ft,
      lemmaId: `H${STRONGS_REGEX.exec(lemmaId)?.[0] ?? lemmaId}`,
      text: el.footnote.find((el: any) => '+w' in el)['+w']?.[0] ?? '',
    };
  } else {
    return;
  }
}

function findWord(el: any) {
  if (typeof el !== 'object' || !('w' in el)) {
    return;
  }

  const lemmaId = el.attributes.find((el: any) => 'strong' in el)?.strong;
  const cleanedLemmaId = `H${STRONGS_REGEX.exec(lemmaId)?.[0] ?? lemmaId}`;

  return {
    lemmaId: cleanedLemmaId,
    text: el.w?.[0],
  };
}

function skipUnknown(el: any) {
  return !!el && (typeof el !== 'object' || !('w' in el || 'footnote' in el));
}

function compareWord(
  dbWord: DbWordToCompare | undefined,
  refWord: RefWordToCompare
) {
  if (!dbWord) {
    console.log(`missing word: ${refWord.text} ${refWord.lemmaId}`);
    return;
  }

  const key = `${dbWord.lemmaId} -> ${refWord.lemmaId}`;
  if (
    refWord.lemmaId.slice(0, 5) !== dbWord.lemmaId &&
    dbWord.lemmaId !== 'H????'
  ) {
    if (!unique.has(key)) {
      unique.set(key, [dbWord.wordId]);
    } else {
      unique.get(key)?.push(dbWord.wordId);
    }
    // console.log(
    //   dbWord.wordId,
    //   key,
    //   `${dbWord.text} -> ${refWord.text}`,
    //   refWord.lemmaId === dbWord.lemmaId
    // );
  }
  console.log(
    dbWord.wordId,
    key,
    `${dbWord.text} -> ${refWord.text}`,
    refWord.lemmaId === dbWord.lemmaId
  );
}

async function run() {
  // await parseBook(1, '01-GEN.usfm');
  // await parseBook(2, '02-EXO.usfm');
  // await parseBook(3, '03-LEV.usfm');
  await parseBook(4, '04-NUM.usfm');
  // await parseBook(5, '05-DEU.usfm');
  // await parseBook(6, '06-JOS.usfm');
  // await parseBook(7, '07-JDG.usfm');
  // await parseBook(8, '08-RUT.usfm');
  // await parseBook(9, '09-1SA.usfm');
  // await parseBook(10, '10-2SA.usfm');
  // await parseBook(11, '11-1KI.usfm');
  // await parseBook(12, '12-2KI.usfm');
  // await parseBook(31, '31-OBA.usfm');
  console.log(unique);
}

run().catch(console.error);
