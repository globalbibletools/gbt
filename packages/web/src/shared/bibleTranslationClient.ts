import { BibleClient } from '@gracious.tech/fetch-client';

export type BibleTranslation = {
  id: string;
  name: string;
};

// For some reason, fetch.bible uses non-standard language codes.
const langCodeMapping: Record<string, string> = {
  en: 'eng',
  es: 'spa',
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
    // Filter by language, if the language code is in langCodeMapping
    if (languageCode && langCodeMapping[languageCode]) {
      options.language = langCodeMapping[languageCode];
    }
    const translations = await collection.get_translations(options);
    return translations.map(({ id, name_english, name_local }) => ({
      id,
      // Sometimes name_local is an empty string, so fallback to name_english
      name: name_local ? name_local : name_english,
    }));
  }
}

const bibleTranslationClient = new BibleTranslationClient();
export default bibleTranslationClient;
