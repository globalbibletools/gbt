import type {
  GetLanguageMembersResponseBody,
  GetLanguageResponseBody,
  GetLanguagesResponseBody,
  PatchLanguageRequestBody,
  PostLanguageRequestBody,
} from '@translation/api-types';
import type ApiClient from './client';

export {
  GetLanguageResponseBody,
  GetLanguagesResponseBody,
  PatchLanguageRequestBody,
  PostLanguageRequestBody,
};

export default class Languages {
  constructor(private readonly client: ApiClient) {}

  findAll(): Promise<GetLanguagesResponseBody> {
    return this.client.get({
      path: '/api/languages',
    });
  }

  async create(language: PostLanguageRequestBody): Promise<void> {
    await this.client.post({
      path: '/api/languages',
      body: language,
    });
  }

  findByCode(code: string): Promise<GetLanguageResponseBody> {
    return this.client.get({
      path: `/api/languages/${code}`,
    });
  }

  async update(
    code: string,
    language: PatchLanguageRequestBody
  ): Promise<void> {
    await this.client.patch({
      path: `/api/languages/${code}`,
      body: language,
    });
  }

  findMembers(code: string): Promise<GetLanguageMembersResponseBody> {
    return this.client.get({
      path: `/api/languages/${code}/members`,
    });
  }
}
