import { parseLexicon } from './helpers/parse-lexicon';
import { Lemma, LemmaResource, PrismaClient } from '@prisma/client';

const client = new PrismaClient();

const importBdb = async () => {
  const parsed = await parseLexicon('data/lexicon/hebrew.txt', ['BdbMedDef']);
  console.log(`Parsed ${Object.keys(parsed).length} words`);
  await client.lemmaResource.deleteMany({
    where: {
      resourceCode: 'BDB',
    },
  });
  const lemmaData: Lemma[] = [];
  const resourceData: LemmaResource[] = [];
  Object.keys(parsed)
    .filter((lemmaId) => {
      if (typeof parsed[lemmaId]['BdbMedDef'] === 'undefined') {
        console.error('Missing definition for', lemmaId);
        return false;
      }
      return true;
    })
    .forEach((lemmaId) => {
      lemmaData.push({ id: lemmaId });
      const content = parsed[lemmaId]['BdbMedDef'];
      resourceData.push({ lemmaId, resourceCode: 'BDB' as const, content });
    });
  // We have to create non-existent lemmas, so that the foreign key on lemma
  // resources has something to point to.
  await client.lemma.createMany({ data: lemmaData, skipDuplicates: true });
  await client.lemmaResource.createMany({ data: resourceData });
  console.log('Successfully imported BDB definitions');
};

console.log('Import BDB definitions...');
importBdb();
