import { bookKeys } from './book-keys';

export const morphologyData = Object.fromEntries(
  bookKeys.map((key) => [require(`./morphology/${key}`) as string[][][]])
);
