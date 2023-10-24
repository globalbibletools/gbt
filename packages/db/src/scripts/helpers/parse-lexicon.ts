import { createReadStream } from 'fs';
import { createInterface } from 'readline';

export const parseLexicon = async (
  filename: string,
  keys: string[]
): Promise<Record<string, Record<string, string>>> => {
  const input = createReadStream(filename);
  const reader = createInterface({ input });
  const parsed: Record<string, Record<string, string>> = {};
  let currentId = '';
  let currentData: Record<string, string> = {};
  for await (const line of reader) {
    const indicator = line[0];
    const rest = line.substring(1);
    if (indicator == '$') {
      if (currentId) {
        // Record the last data before overwriting the temporary variables.
        parsed[currentId] = currentData;
        // console.log(currentId, currentData);
      }
      currentId = rest.replaceAll('=', '');
      // console.log(currentId);
      currentData = {};
    } else if (indicator == '@') {
      const [key, value] = rest.split('=\t', 2);
      if (keys.includes(key)) {
        currentData[key] = toMarkDown(value);
      }
    }
  }
  reader.close();
  return parsed;
};

const toMarkDown = (raw: string): string => {
  return raw
    .replaceAll('<br>', '\n\n')
    .replaceAll('<B>', '<BR>')
    .replaceAll('<BR>', '\n\n');
};
