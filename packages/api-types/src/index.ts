// Prisma handles enums differently according to this issue in typescript:
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum<T extends { [index: string]: U }, U extends string>(x: T) {
  return x;
}

export interface ErrorDetail {
  code: string;
}

export interface ErrorResponse {
  errors: ErrorDetail[];
}

export const SystemRole = makeEnum({
  Admin: 'ADMIN',
});
export type SystemRole = typeof SystemRole[keyof typeof SystemRole];

export interface User {
  id: string;
  name?: string;
  email?: string;
  systemRoles: SystemRole[];
}

export interface GetSessionResponse {
  user?: User;
}

export interface PostLoginRequest {
  email: string;
  redirectUrl: string;
}

export interface GetLoginRequest {
  token: string;
  redirectUrl: string;
}

export interface GetInviteRequestQuery {
  token: string;
}

export interface GetInviteResponseBody {
  email: string;
}

export interface PostInviteRequestBody {
  token: string;
  name: string;
}

export interface GetUsersResponseBody {
  data: User[];
}

export interface PostUserRequestBody {
  email: string;
  redirectUrl: string;
}

export interface UpdateUserRequestBody {
  systemRoles?: SystemRole[];
}

export interface Language {
  code: string;
  name: string;
}

export interface GetLanguagesResponseBody {
  data: Language[];
}

export interface GetLanguageResponseBody {
  data: Language;
}

export type PostLanguageRequestBody = Language;

export type PatchLanguageRequestBody = Partial<Omit<Language, 'code'>>;

export const LanguageRole = makeEnum({
  Admin: 'ADMIN',
  Translator: 'TRANSLATOR',
});
export type LanguageRole = typeof LanguageRole[keyof typeof LanguageRole];

export interface LanguageMember {
  userId: string;
  name?: string;
  email?: string;
  roles: LanguageRole[];
}

export interface GetLanguageMembersResponseBody {
  data: LanguageMember[];
}

export interface PostLanguageMemberRequestBody {
  email: string;
  roles: LanguageRole[];
  redirectUrl: string;
}

export interface VerseWord {
  id: string;
  text: string;
  lemmaId: string;
  formId: string;
  grammar: string;
}

export interface GetVerseResponseBody {
  data: {
    id: string;
    words: VerseWord[];
  };
}

export interface Gloss {
  wordId: string;
  approvedGloss?: string;
  glosses: string[];
}

export interface GetVerseGlossesResponseBody {
  data: Gloss[];
}

export interface PatchWordGlossRequestBody {
  gloss?: string;
}
