import { parseLexicon } from './helpers/parse-lexicon';

const regex = /<.*?>/g;

const importBdb = async () => {
  const parsed = await parseLexicon(
    'packages/db/src/scripts/lexicon-data/hebrew.txt',
    ['BdbMedDef']
  );
  const special: Record<string, number> = {};
  console.log('Parsed word count:', Object.keys(parsed).length);
  for (const key in parsed) {
    const def = parsed[key]['BdbMedDef'];
    if (def) {
      for (const match of def.matchAll(regex)) {
        const tag = match[0];
        if (!(tag in special)) {
          special[tag] = 0;
        }
        special[tag] += 1;
      }
    } else {
      console.log('MISSING DEFINITION FOR', key);
    }
  }
  console.log(special);
};

console.log('Import BDB definitions...');
importBdb();
