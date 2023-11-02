import { Lemma, LemmaResource, PrismaClient } from '@prisma/client';
import { parseLexicon } from './parse-lexicon';

const client = new PrismaClient();

const regex = /<(?!\/).*?>/g;

export const importLexicon = async (
  resourceCode: 'BDB' | 'LSJ',
  filename: string,
  definitionField: string
) => {
  console.log(`Importing ${resourceCode} definitions...`);
  const parsed = await parseLexicon(filename, [definitionField]);
  console.log(`Parsed ${Object.keys(parsed).length} words`);
  await client.lemmaResource.deleteMany({ where: { resourceCode } });
  const lemmaData: Lemma[] = [];
  const resourceData: LemmaResource[] = [];
  const special: Record<string, number> = {};
  Object.keys(parsed)
    .filter((lemmaId) => {
      if (typeof parsed[lemmaId][definitionField] === 'undefined') {
        console.error('Missing definition for', lemmaId);
        return false;
      }
      return true;
    })
    .forEach((lemmaId) => {
      lemmaData.push({ id: lemmaId });
      const content = parsed[lemmaId][definitionField];
      for (const match of content.matchAll(regex)) {
        const tag = match[0];
        if (!(tag in special)) {
          special[tag] = 0;
        }
        special[tag] += 1;
      }
      resourceData.push({ lemmaId, resourceCode, content });
    });
  console.log(JSON.stringify(special, null, 2));
  // We have to create non-existent lemmas, so that the foreign key on lemma
  // resources has something to point to.
  // await client.lemma.createMany({ data: lemmaData, skipDuplicates: true });
  // await client.lemmaResource.createMany({ data: resourceData });
  console.log(`Successfully imported ${resourceCode} definitions`);
};
