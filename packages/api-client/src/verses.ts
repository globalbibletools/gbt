import type {
  GetVerseSuggestionsResponseBody,
  GetVerseResponseBody,
  GetLemmaResourcesResponseBody,
  GetVersePhrasesResponseBody,
  GetNextUnapprovedVerseResponseBody,
} from '@translation/api-types';
import ApiClient from './client';

export { GetVerseResponseBody };

export default class Verses {
  constructor(private readonly client: ApiClient) {}

  findById(verseId: string): Promise<GetVerseResponseBody> {
    return this.client.get({
      path: `/api/verses/${verseId}`,
    });
  }

  findVersePhrases(
    verseId: string,
    language: string
  ): Promise<GetVersePhrasesResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/verses/${verseId}/phrases`,
    });
  }

  findVerseSuggestions(
    verseId: string,
    language: string
  ): Promise<GetVerseSuggestionsResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/verses/${verseId}/suggestions`,
    });
  }

  findLemmaResources(verseId: string): Promise<GetLemmaResourcesResponseBody> {
    return this.client.get({ path: `/api/verses/${verseId}/lemma-resources` });
  }

  findNextUnapprovedVerse(
    verseId: string,
    language: string
  ): Promise<GetNextUnapprovedVerseResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/verses/${verseId}/next-unapproved-verse`,
    });
  }
}
