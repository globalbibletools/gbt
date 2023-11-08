const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

import { createReadStream } from 'fs';
import { createInterface } from 'readline';

/**
 * This is used to parse the strongs file, so that the entries can be inserted
 * into the DB.
 */
export const parseStrongs = async (
  filename: string,
  keys: string[]
): Promise<Record<string, Record<string, string>>> => {
  const input = createReadStream(filename);
  const reader = createInterface({ input });
  reader.close();
  return {};
};
