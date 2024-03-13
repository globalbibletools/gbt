import { Lemma, LemmaResource, PrismaClient } from '@prisma/client';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

const client = new PrismaClient();

const LSJ_FILE = 'data/lexicon/greek.txt';
const RESOURCE_CODE = 'LSJ';

async function parseLsj(filename: string) {
  const parsed: Record<string, string> = {};
  await lineByLine(filename, (line) => {
    const split = line.split('\t');
    const id = split[0];
    const definition = toMarkDown(split[7]);
    if (!parsed[id]) {
      parsed[id] = definition;
    }
  });
  return parsed;
}

async function lineByLine(filename: string, callback: (line: string) => void) {
  const input = createReadStream(filename);
  const reader = createInterface({ input });
  const parsed: Record<string, string> = {};
  for await (const line of reader) {
    callback(line);
  }
  reader.close();
  return parsed;
}

function toMarkDown(raw: string): string {
  return (
    raw
      .replaceAll('<Level1>', '')
      .replaceAll('<Level2>', '')
      .replaceAll('<Level3>', '')
      .replaceAll('<Level4>', '')
      .replaceAll('</Level1>', '')
      .replaceAll('</Level2>', '')
      .replaceAll('</Level3>', '')
      .replaceAll('</Level4>', '')
      .replaceAll('<lb />', '')
      .replaceAll('</a>]', '')
      .replaceAll('</a>', '')
      .replaceAll(/\[?<a[^>]*>/g, '')
      .replaceAll(/<ref=".*?">(.*?)<\/ref>/g, replaceRef)
      .replaceAll(/<ref='.*?'>(.*?)<\/ref>/g, replaceRef)
      .replaceAll('<date>', '')
      .replaceAll('</date>', '')
      // We wrap all greek text in a span so we can control its style separately.
      .replaceAll(
        /(?:[\u0386-\u03ce\u1f00-\u1ffe]+[^A-Za-z()<>{}]*)+[\u0386-\u03ce\u1f00-\u1ffe]+/g,
        '<span class="lexicon-greek">$&</span>'
      )
      .replaceAll(
        /(?:[\u0591-\u05F4]+[^A-Za-z()<>{}]*)+[\u0591-\u05F4]+/g,
        '<span class="lexicon-hebrew" dir="rtl">$&</span>'
      )
  );
}

// TODO: unit test this function.
const replaceRef = (_match: string, overallRef: string) => {
  const refs = overallRef.split(' ');
  let currentBook = '';
  let currentChapter = '';
  const outputRefs: string[] = [];
  for (const ref of refs) {
    const split = ref.split(/[.]|:/g).filter((s) => s != '');
    let fullRef;
    if (split.length == 1) {
      // Prepend the current book and chapter
      fullRef = currentBook + '.' + currentChapter + ':' + ref;
    } else if (split.length == 2) {
      currentChapter = split[0];
      // Prepend the current book
      fullRef = currentBook + ':' + ref;
    } else if (split.length == 3) {
      currentBook = split[0];
      currentChapter = split[1];
      // The ref is good as-is
      fullRef = ref;
    }
    outputRefs.push(`<a class="ref" data-ref="${fullRef}">${ref}</a>`);
  }
  return outputRefs.join(' ');
};

async function importLSJ() {
  console.log(`Importing LSJ definitions...`);
  const parsed = await parseLsj(LSJ_FILE);
  console.log(`Parsed ${Object.keys(parsed).length} words`);
  await client.lemmaResource.deleteMany({
    where: { resourceCode: RESOURCE_CODE },
  });
  const lemmaData: Lemma[] = [];
  const resourceData: LemmaResource[] = [];
  Object.keys(parsed)
    .filter((lemmaId) => {
      if (typeof parsed[lemmaId] === 'undefined') {
        console.error('Missing definition for', lemmaId);
        return false;
      }
      return true;
    })
    .forEach((lemmaId) => {
      lemmaData.push({ id: lemmaId });
      const content = parsed[lemmaId];
      resourceData.push({ lemmaId, resourceCode: RESOURCE_CODE, content });
    });
  // We have to create non-existent lemmas, so that the foreign key on lemma
  // resources has something to point to.
  await client.lemma.createMany({ data: lemmaData, skipDuplicates: true });
  await client.lemmaResource.createMany({ data: resourceData });
  console.log(`Successfully imported LSJ definitions`);
}

importLSJ().catch(console.error);
