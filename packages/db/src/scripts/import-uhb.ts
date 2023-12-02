import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { Prisma, PrismaClient, UHBWord } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { USFMParser, LEVEL_RELAXED } = require('usfm-grammar');

const client = new PrismaClient();

const USFM_PATH = resolve(__dirname, '../../../../data/morphology');

async function importBook(bookId: number, file: string): Promise<UHBWord[]> {
  console.log(file);
  // TODO: figure out how to deal with tags that usfm parser doesn't recognize
  const data = loadUsfmAsJson(join(USFM_PATH, file));

  const words: UHBWord[] = [];

  for (let c = 0; c < data.chapters.length; c++) {
    const chapterId = [
      bookId.toString().padStart(2, '0'),
      (c + 1).toString().padStart(3, '0'),
    ].join('');
    const chapter = data.chapters[c];
    const verses = chapter.contents.filter((el: any) => 'verseNumber' in el);

    for (let v = 0; v < verses.length; v++) {
      const verseId = [chapterId, (v + 1).toString().padStart(3, '0')].join('');
      const verse = verses[v];

      const verseData = await client.word.findMany({
        where: { verseId },
        orderBy: {
          id: Prisma.SortOrder.asc,
        },
      });

      let w = 1;
      let p = 0;
      let dbW = 0;
      for (const element of verse.contents) {
        if (typeof element === 'string') {
          const lastWord = words.at(-1);
          if (lastWord) {
            if (element === '׀') {
              lastWord.text += ' ׀';
            } else {
              lastWord.text += element.replace('ס', '').replace('פ', '');
            }
          }
        } else if ('w' in element) {
          const parts = verseData[dbW]?.text
            .split(/( (?!׀)|־)/)
            .filter((part) => !!part && part !== '־' && part !== ' ');
          if (parts) {
            if (p >= parts.length) {
              dbW++;
              p = 1;
            } else {
              p++;
            }
          }
          words.push({
            id: `${verseId}${(w++).toString().padStart(2, '0')}`,
            text: element.w[0].normalize('NFD'),
            strong: element.attributes[1].strong,
            morph: element.attributes[2]['x-morph'],
            wordId: verseData[dbW]?.id,
            type: null,
          });
        } else if ('footnote' in element) {
          const type = element.footnote[1].ft;
          const footnoteWords = element.footnote.slice(2);
          for (const ftElement of footnoteWords) {
            if (typeof ftElement === 'string') {
              const lastWord = words.at(-1);
              if (lastWord) {
                lastWord.text += ftElement;
              }
            } else if ('+w' in ftElement) {
              const parts = verseData[dbW]?.text
                .split(/( (?!׀)|־)/)
                .filter((part) => !!part && part !== '־' && part !== ' ');
              if (parts) {
                if (p >= parts.length) {
                  dbW++;
                  p = 1;
                } else {
                  p++;
                }
              }
              words.push({
                id: `${verseId}${(w++).toString().padStart(2, '0')}`,
                type,
                text: ftElement['+w'][0].normalize('NFD'),
                strong: ftElement.attributes[1].strong,
                morph: ftElement.attributes[2]['x-morph'],
                wordId: verseData[dbW]?.id,
              });
            }
          }
        }
      }
    }
  }

  await client.uHBWord.createMany({
    data: words,
  });

  return words;
}

function loadUsfmAsJson(file: string): any {
  const data = readFileSync(file).toString();
  const parser = new USFMParser(data, LEVEL_RELAXED);
  return parser.toJSON();
}

async function run() {
  await client.uHBWord.deleteMany();

  const words = [
    ...(await importBook(1, '01-GEN.usfm')),
    ...(await importBook(2, '02-EXO.usfm')),
    ...(await importBook(3, '03-LEV.usfm')),
    ...(await importBook(4, '04-NUM.usfm')),
    ...(await importBook(5, '05-DEU.usfm')),
    ...(await importBook(6, '06-JOS.usfm')),
    ...(await importBook(7, '07-JDG.usfm')),
    ...(await importBook(8, '08-RUT.usfm')),
    ...(await importBook(9, '09-1SA.usfm')),
    ...(await importBook(10, '10-2SA.usfm')),
    ...(await importBook(11, '11-1KI.usfm')),
    ...(await importBook(12, '12-2KI.usfm')),
    ...(await importBook(13, '13-1CH.usfm')),
    ...(await importBook(14, '14-2CH.usfm')),
    ...(await importBook(15, '15-EZR.usfm')),
    ...(await importBook(16, '16-NEH.usfm')),
    ...(await importBook(17, '17-EST.usfm')),
    ...(await importBook(18, '18-JOB.usfm')),
    ...(await importBook(19, '19-PSA.usfm')),
    ...(await importBook(20, '20-PRO.usfm')),
    ...(await importBook(21, '21-ECC.usfm')),
    ...(await importBook(22, '22-SNG.usfm')),
    ...(await importBook(23, '23-ISA.usfm')),
    ...(await importBook(24, '24-JER.usfm')),
    ...(await importBook(25, '25-LAM.usfm')),
    ...(await importBook(26, '26-EZK.usfm')),
    ...(await importBook(27, '27-DAN.usfm')),
    ...(await importBook(28, '28-HOS.usfm')),
    ...(await importBook(29, '29-JOL.usfm')),
    ...(await importBook(30, '30-AMO.usfm')),
    ...(await importBook(31, '31-OBA.usfm')),
    ...(await importBook(32, '32-JON.usfm')),
    ...(await importBook(33, '33-MIC.usfm')),
    ...(await importBook(34, '34-NAM.usfm')),
    ...(await importBook(35, '35-HAB.usfm')),
    ...(await importBook(36, '36-ZEP.usfm')),
    ...(await importBook(37, '37-HAG.usfm')),
    ...(await importBook(38, '38-ZEC.usfm')),
    ...(await importBook(39, '39-MAL.usfm')),
  ];
}

run().catch(console.error);
