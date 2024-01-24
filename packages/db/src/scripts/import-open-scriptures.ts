import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs';
import * as path from 'path';
import { OSWord, PrismaClient } from '@prisma/client';

const parser = new XMLParser({ ignoreAttributes: false, preserveOrder: true });

const client = new PrismaClient();

const corrections: { [id: string]: number } = {
  '0103104705': -1,
};

async function importBook(file: string, bookId: number) {
  const fileData = fs.readFileSync(
    path.resolve(__dirname, `../../../../data/morphology/${file}`)
  );
  const data = parser.parse(fileData);

  const words: OSWord[] = [];

  const rawChapters = data[1].osis[0].osisText[1].div;
  for (const rawChapter of rawChapters) {
    const splitChapterId = rawChapter[':@']['@_osisID'].split('.') as string[];
    const chId = `${bookId
      .toString()
      .padStart(2, '0')}${splitChapterId[1].padStart(3, '0')}`;
    for (const rawVerse of rawChapter.chapter) {
      const splitVerseId = rawVerse[':@']['@_osisID'].split('.');
      const vId = `${chId}${splitVerseId[2].padStart(3, '0')}`;

      const rawWords = rawVerse.verse
        .flatMap((rawWord: any) => {
          if ('note' in rawWord && rawWord[':@']?.['@_type'] === 'variant') {
            return rawWord.note[1].rdg;
          }
          return rawWord;
        })
        .filter((el: any) => 'w' in el);

      let index = 1;
      let wordIndex = 1;
      for (const rawWord of rawWords) {
        const word = words.at(-1);
        if (word?.strong.includes('+')) {
          word.strong = rawWord[':@']['@_lemma'];
          word.text += rawWord.w[0]['#text'];
        } else {
          const id = `${vId}${index.toString().padStart(2, '0')}`;
          wordIndex += corrections[id] ?? 0;
          const wordId = `${vId}${wordIndex.toString().padStart(2, '0')}`;
          const strong = rawWord[':@']['@_lemma'];
          index++;
          wordIndex++;
          words.push({
            id,
            text: rawWord.w[0]['#text'],
            strong,
            morph: rawWord[':@']['@_morph'],
            type: null,
            wordId,
          });
        }
      }
    }
  }

  await client.oSWord.createMany({
    data: words,
    skipDuplicates: true,
  });
}

importBook('Gen.xml', 1);
