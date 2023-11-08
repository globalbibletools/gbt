import { XMLParser } from 'fast-xml-parser';

import { readFileSync } from 'fs';

/**
 * This is used to parse the strongs file, so that the entries can be inserted
 * into the DB.
 */
export const parseStrongs = (
  filename: string,
  keyPrefix: 'H' | 'G'
): Record<string, string> => {
  const parser = new XMLParser();
  const data = readFileSync(filename);
  const entries = parser.parse(data)['strongsdictionary']['entries']['entry'];
  const output: Record<string, string> = {};
  for (const entry of entries) {
    const key = keyPrefix + entry['strongs'].toString().padStart(4, '0');
    let content = entry['strongs_def'];
    if (typeof content === 'object') {
      content = content['#text'];
    }
    if (typeof content !== 'undefined') {
      output[key] = content.replaceAll('\n', ' ').trim();
    }
  }
  return output;
};
