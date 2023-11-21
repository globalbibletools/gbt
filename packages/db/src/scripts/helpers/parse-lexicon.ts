import { createReadStream } from 'fs';
import { createInterface } from 'readline';

export const parseBdb = async (filename: string) => {
  const parsed: Record<string, string> = {};
  let currentId = '';
  await lineByLine(filename, (line) => {
    const indicator = line[0];
    const rest = line.substring(1);
    if (indicator == '@') {
      const [key, value] = rest.split('=\t', 2);
      if (key == 'BdbMedDef') {
        parsed[currentId] = toMarkDown(value);
      } else if (key == 'StrNo') {
        currentId = value;
      }
    }
  });
  return parsed;
};

export const parseLsj = async (filename: string) => {
  const parsed: Record<string, string> = {};
  await lineByLine(filename, (line) => {
    const split = line.split('\t');
    const id = split[1].split('=')[0].trim();
    const definition = toMarkDown(split[7]);
    parsed[id] = definition;
  });
  return parsed;
};

const lineByLine = async (
  filename: string,
  callback: (line: string) => void
) => {
  const input = createReadStream(filename);
  const reader = createInterface({ input });
  const parsed: Record<string, string> = {};
  for await (const line of reader) {
    callback(line);
  }
  reader.close();
  return parsed;
};

const toMarkDown = (raw: string): string => {
  return raw
    .replaceAll('<Level1>', '\n# ')
    .replaceAll('<Level2>', '\n## ')
    .replaceAll('<Level3>', '\n### ')
    .replaceAll('<Level4>', '\n#### ')
    .replaceAll('</Level1>', '\n')
    .replaceAll('</Level2>', '\n')
    .replaceAll('</Level3>', '\n')
    .replaceAll('</Level4>', '\n')
    .replaceAll('<b>', '**')
    .replaceAll('</b>', '**')
    .replaceAll('<br>', '\n\n')
    .replaceAll('<br />', '\n\n')
    .replaceAll('<lb />', '\n\n') // I think it is short for "line break"
    .replaceAll('<BR>', '\n\n')
    .replaceAll('<B>', '\n\n')
    .replaceAll('<BR />', '\n\n')
    .replaceAll('<i>', '*')
    .replaceAll('</i>', '*')
    .replaceAll(/<ref=".*">/g, '')
    .replaceAll(/<ref='.*'>/g, '')
    .replaceAll('</ref>', '')
    .replaceAll(/\[?<a[^>]*>/g, '')
    .replaceAll('</a>]', '')
    .replaceAll('</a>', '')
    .replaceAll('<u>', '') // Markdown doesn't have underline
    .replaceAll('</u>', '')
    .replaceAll('<date>', '')
    .replaceAll('</date>', '');
};
