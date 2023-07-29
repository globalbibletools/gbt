import { bookKeys } from './book-keys';

export const morphologyData: Record<string, string[][][]> = Object.fromEntries(
  bookKeys.map((key) => [key, require(`./morphology/${key}`) as string[][][]])
);
