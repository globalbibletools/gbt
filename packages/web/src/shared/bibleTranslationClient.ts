import { BibleClient } from '@gracious.tech/fetch-client';

export type BibleTranslation = {
  id: string;
  name: string;
};

class BibleTranslationClient {
  async getOptions(): Promise<BibleTranslation[]> {
    return [
      {
        name: 'King James Version',
        id: 'kjv',
      },
      {
        name: 'New International Version',
        id: 'niv',
      },
      {
        name: 'English Standard Version',
        id: 'esv',
      },
    ];
  }
}

const bibleTranslationClient = new BibleTranslationClient();
export default bibleTranslationClient;
