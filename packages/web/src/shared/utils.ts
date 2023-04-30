import verseCounts from '../assets/verse-counts.json';

export type VerseInfo = { bookId: number, chapterNumber: number, verseNumber: number };

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
 * @param verseId The verse ID to be parsed, in the form BBCCCVVV.
 * @returns An object containing three keys: `bookId`, `chapterNumber`, and `verseNumber`.
 */
// TODO: some kind of error handling for invalid verse IDs.
export function parseVerseId(verseId: string): VerseInfo {
  const bookId = parseInt(verseId.slice(0, 2));
  const chapterNumber = parseInt(verseId.slice(2, 5));
  const verseNumber = parseInt(verseId.slice(5, 8));
  return { bookId, chapterNumber, verseNumber };
}


/**
 * Generate a verse ID of form BBCCCVVV.
 * BB - `bookId`
 * CCC - `chapterNumber`
 * VVV - `verseNumber`
 * @param verseInfo An object containing three keys: `bookId`, `chapterNumber`, and `verseNumber`
 * @returns The generate verse ID, in the form BBCCCVVV.
 */
export function generateVerseId({ bookId, chapterNumber, verseNumber }: VerseInfo) {
  return [
    bookId.toString().padStart(2, '0'),
    chapterNumber.toString().padStart(3, '0'),
    verseNumber.toString().padStart(3, '0'),
  ].join('');
}

/**
 * Get the verse ID of the previous verse of the Bible.
 * Wraps across chapters and books, and from Revelations to Genesis.
 * @param verseId The current verse ID.
 * @returns The verse ID of the previous verse of the Bible.
 */
// TODO: It would be good to have unit tests for this function.
export function decrementVerseId(verseId: string) {
  let { bookId, chapterNumber, verseNumber }: VerseInfo = parseVerseId(verseId);
  verseNumber -= 1;
  if (verseNumber < 1) {
    // Wrap to previous chapter.
    chapterNumber -= 1;
    if (chapterNumber < 1) {
      // Wrap to previous book.
      bookId -= 1;
      if (bookId < 1) {
        // Wrap around to Revelations.
        bookId = 66;
      }
      // Last chapter of the book.
      chapterNumber = verseCounts[bookId - 1].length
    }
    // Last verse of the chapter.
    verseNumber = verseCounts[bookId - 1][chapterNumber - 1];
  }
  return generateVerseId({ bookId, chapterNumber, verseNumber });
}

/**
 * Get the verse ID of the next verse of the Bible.
 * Wraps across chapters and books, and from Genesis to Revelations.
 * @param verseId The current verse ID.
 * @returns The verse ID of the next verse of the Bible.
 */
// TODO: It would be good to have unit tests for this function.
export function incrementVerseId(verseId: string) {
  let { bookId, chapterNumber, verseNumber }: VerseInfo = parseVerseId(verseId);
  const chapterCount = verseCounts[bookId - 1].length;
  const verseCount = verseCounts[bookId - 1][chapterNumber - 1];
  verseNumber += 1;
  if (verseNumber > verseCount) {
    // Wrap to next chapter.
    chapterNumber += 1;
    if (chapterNumber > chapterCount) {
      // Wrap to next book.
      bookId += 1;
      if (bookId > 66) {
        // Wrap around to Genesis.
        bookId = 1;
      }
      chapterNumber = 1;
    }
    verseNumber = 1;
  }
  return generateVerseId({ bookId, chapterNumber, verseNumber });
}