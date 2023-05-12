// This file contains utility functions related to verse IDs.

import verseCounts from './verse-counts.json';
import { clamp } from '../../shared/utils';
import { TFunction } from 'i18next';
import { bookKeys } from './book-keys';

export type VerseInfo = {
  bookId: number;
  chapterNumber: number;
  verseNumber: number;
};

/**
 * Count the chapters in a given book of the Bible.
 * @param bookId The ID of the book to use.
 * @returns The number of chapters in the book.
 */
export function chapterCount(bookId: number): number {
  return verseCounts[bookId - 1].length;
}

/**
 * Count the verses in a given chapter of the Bible.
 * @param bookId The ID of the book to use.
 * @param chapterNumber The number of the chapter to use (1 indexed).
 * @returns The number of verses in the chapter.
 */
export function verseCount(bookId: number, chapterNumber: number): number {
  return verseCounts[bookId - 1][chapterNumber - 1];
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
export function generateVerseId({
  bookId,
  chapterNumber,
  verseNumber,
}: VerseInfo) {
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
      chapterNumber = chapterCount(bookId);
    }
    // Last verse of the chapter.
    verseNumber = verseCount(bookId, chapterNumber);
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
  verseNumber += 1;
  if (verseNumber > verseCount(bookId, chapterNumber)) {
    // Wrap to next chapter.
    chapterNumber += 1;
    if (chapterNumber > chapterCount(bookId)) {
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

/**
 * Get the name of the book, using the i18n translation function.
 * @param bookId The book to use.
 * @param t The i18n translation function to use.
 * @returns The translated name of the book.
 */
export function bookName(bookId: number, t: TFunction) {
  return t(bookKeys[bookId - 1], { ns: 'bible' });
}

/**
 * Try to parse a verse ID from a reference, using the i18n translation function.
 * @param reference The string that should be parsed. In the form "bookName chapterNumber:verseNumber". Example: "Exo 3:14".
 * @param t The i18n translation function to use.
 * @returns The verse ID if it can be determined, otherwise `null`.
 */
export function parseReference(reference: string, t: TFunction): string | null {
  // Parse the reference into three parts.
  const referenceRegex = new RegExp(
    t('reference_regex', { ns: 'bible' }) as string
  );
  const matches = reference.match(referenceRegex);
  if (matches == null) {
    return null;
  }
  const [, , chapterStr, verseStr] = matches;
  let bookStr = matches[1];
  bookStr = bookStr.toLowerCase().trim();
  // Find the book ID.
  let bookId;
  for (let i = 0; i < bookKeys.length; i++) {
    const bookTerms = t(bookKeys[i], { ns: 'bible', context: 'match' });
    for (const term of bookTerms) {
      if (term.toLowerCase() == bookStr) {
        bookId = i + 1;
        break;
      }
    }
  }
  if (bookId == null) {
    return null;
  }
  // Coerce the chapter number to be valid.
  const chapterNumber = clamp(parseInt(chapterStr), 1, chapterCount(bookId));
  // Coerce the verse number to be valid.
  const verseNumber = clamp(
    parseInt(verseStr),
    1,
    verseCount(bookId, chapterNumber)
  );
  return generateVerseId({ bookId, chapterNumber, verseNumber });
}

/**
 * Generate a localized reference for the given verse.
 * @param verseInfo The verse to reference.
 * @param t The i18n translation function to use.
 * @returns The human-readable Bible reference.
 */
export function generateReference(verseInfo: VerseInfo, t: TFunction) {
  return t('reference_format', {
    ...verseInfo,
    bookName: bookName(verseInfo.bookId, t),
    ns: 'bible',
  });
}
