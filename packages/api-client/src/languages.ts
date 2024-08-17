import {
  GetLanguageImportResponseBody,
  PostBulkGlossesRequestBody,
  type GetLanguageMembersResponseBody,
  type GetLanguageResponseBody,
  type GetLanguagesResponseBody,
  type LanguageRole,
  type PatchLanguageMemberRequestBody,
  type PatchLanguageRequestBody,
  type PostLanguageImportRequestBody,
  type PostLanguageMemberRequestBody,
  type PostLanguageRequestBody,
  GetLanguagesProgressResponseBody,
  GetLanguageProgressResponseBody,
  GetLanguageReadingChapterResponseBody,
  GetBookProgressResponseBody,
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

  findProgresses(): Promise<GetLanguagesProgressResponseBody> {
    return this.client.get({
      path: '/api/languages/progress',
    });
  }

  findProgress(code: string): Promise<GetLanguageProgressResponseBody> {
    return this.client.get<GetLanguageProgressResponseBody>({
      path: `/api/languages/${code}/progress`,
    });
  }

  readChapter(
    code: string,
    chapter: string
  ): Promise<GetLanguageReadingChapterResponseBody> {
    return this.client.get<GetLanguageReadingChapterResponseBody>({
      path: `/api/languages/${code}/chapters/${chapter}/read`,
    })
  }
  
  findBookProgress(
    bookId: number,
    language: string
  ): Promise<GetBookProgressResponseBody> {
    return this.client.get({
      path: `/api/languages/${language}/books/${bookId}/progress`,
    });
  }

  async create(language: PostLanguageRequestBody): Promise<void> {
    await this.client.post({
      path: '/api/languages',
      body: language,
    });
  }

  async startImport(
    code: string,
    body: PostLanguageImportRequestBody
  ): Promise<void> {
    await this.client.post({
      path: `/api/languages/${code}/import`,
      body,
    });
  }

  getImportStatus(code: string): Promise<GetLanguageImportResponseBody> {
    return this.client.get<GetLanguageImportResponseBody>({
      path: `/api/languages/${code}/import`,
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

  async bulkUpdateGlosses(
    code: string,
    body: PostBulkGlossesRequestBody
  ): Promise<void> {
    await this.client.post({
      path: `/api/languages/${code}/glosses/bulk`,
      body,
    });
  }

  findMembers(code: string): Promise<GetLanguageMembersResponseBody> {
    return this.client.get({
      path: `/api/languages/${code}/members`,
    });
  }

  async inviteMember(
    code: string,
    request: PostLanguageMemberRequestBody
  ): Promise<void> {
    await this.client.post({
      path: `/api/languages/${code}/members`,
      body: request,
    });
  }

  async updateMember(
    code: string,
    userId: string,
    roles: LanguageRole[]
  ): Promise<void> {
    const body: PatchLanguageMemberRequestBody = {
      roles,
    };
    await this.client.patch({
      path: `/api/languages/${code}/members/${userId}`,
      body,
    });
  }

  async removeMember(code: string, userId: string): Promise<void> {
    await this.client.delete({
      path: `/api/languages/${code}/members/${userId}`,
    });
  }
}
