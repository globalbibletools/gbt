import { BibleClient } from '@gracious.tech/fetch-client';
import { bookKeys } from 'data/book-keys';
import { parseVerseId } from '../features/translation/verse-utils';

export type BibleTranslation = {
  id: string;
  name: string;
};

export type BibleVerseTranslation = {
  // The name of the bible translation
  name: string;
  // The content of the verse in that translation.
  translation: string;
};

/**
 * This class acts as a wrapper over all interactions with fetch.bible.
 */
class BibleTranslationClient {
  private client: BibleClient;
  constructor() {
    this.client = new BibleClient();
  }

  async getOptions(languageCode?: string): Promise<BibleTranslation[]> {
    const collection = await this.client.fetch_collection();
    const options: { sort_by_year?: boolean; language?: string } = {};
    options.sort_by_year = true;
    options.language = languageCode;
    const translations = await collection.get_translations(options);
    return translations.map(({ id, name_english, name_local }) => ({
      id,
      // Sometimes name_local is an empty string, so fallback to name_english
      name: name_local ? name_local : name_english,
    }));
  }

  async getTranslation(
    verseId: string,
    translationIds: string[]
  ): Promise<BibleVerseTranslation | null> {
    const { bookId, chapterNumber, verseNumber } = parseVerseId(verseId);
    const bookKey = bookKeys[bookId - 1].toLowerCase();
    const collection = await this.client.fetch_collection();
    const translations = await collection.get_translations();
    for (const translationId of translationIds) {
      try {
        const book = await collection.fetch_book(translationId, bookKey, 'txt');
        const verseTranslation = book.get_verse(chapterNumber, verseNumber, {
          attribute: false,
          verse_nums: false,
          headings: false,
          notes: false,
        });
        const translation = translations.find((t) => t.id === translationId);
        if (translation) {
          const { name_local, name_english } = translation;
          return {
            name: name_local ? name_local : name_english,
            translation: verseTranslation,
          };
        }
      } catch (e) {
        console.log(e);
        // There was some issue getting the verse in this translation, try the
        // next translation.
        continue;
      }
    }
    // Must return null, not undefined, so that this will work with useQuery
    return null;
  }
}

const bibleTranslationClient = new BibleTranslationClient();
export default bibleTranslationClient;
