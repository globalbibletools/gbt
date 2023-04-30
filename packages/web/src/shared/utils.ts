export function capitalize(str: string) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Parse a verse ID of form BBCCCVVV.
 * BB - `bookId`
 * CCC - `chapterNumber`
 * VVV - `verseNumber`
 * @param verseId The verse ID to be parsed, in the form BBCCCCVVV.
 * @returns An object containing three keys: `bookId`, `chapterNumber`, and `verseNumber`.
 */
export function parseVerseId(verseId: string) {
  const bookId = parseInt(verseId.slice(0, 2));
  const chapterNumber = parseInt(verseId.slice(2, 5));
  const verseNumber = parseInt(verseId.slice(5, 8));
  return { bookId, chapterNumber, verseNumber };
}
