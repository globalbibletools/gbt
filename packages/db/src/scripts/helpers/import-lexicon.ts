import { Lemma, LemmaResource, PrismaClient } from '@prisma/client';
import { parseBdb, parseLsj } from './parse-lexicon';

const client = new PrismaClient();

export const importLexicon = async (
  resourceCode: 'BDB' | 'LSJ',
  filename: string
) => {
  console.log(`Importing ${resourceCode} definitions...`);
  const parsed =
    resourceCode == 'BDB' ? await parseBdb(filename) : await parseLsj(filename);
  console.log(`Parsed ${Object.keys(parsed).length} words`);
  await client.lemmaResource.deleteMany({ where: { resourceCode } });
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
      resourceData.push({ lemmaId, resourceCode, content });
    });
  // We have to create non-existent lemmas, so that the foreign key on lemma
  // resources has something to point to.
  await client.lemma.createMany({ data: lemmaData, skipDuplicates: true });
  await client.lemmaResource.createMany({ data: resourceData });
  console.log(`Successfully imported ${resourceCode} definitions`);
};
