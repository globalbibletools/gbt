import type {
  GetVerseGlossesResponseBody,
  GetVerseResponseBody,
  GetLemmaResourcesResponseBody,
  GetVerseNotesResponseBody,
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

  findVerseGlosses(
    verseId: string,
    language: string
  ): Promise<GetVerseGlossesResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/verses/${verseId}/glosses`,
    });
  }

  findLemmaResources(verseId: string): Promise<GetLemmaResourcesResponseBody> {
    return this.client.get({ path: `/api/verses/${verseId}/lemma-resources` });
  }

  findNotes(
    verseId: string,
    language: string
  ): Promise<GetVerseNotesResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/verses/${verseId}/notes`,
    });
  }
}
