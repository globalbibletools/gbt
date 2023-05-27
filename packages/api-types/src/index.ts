export interface ErrorDetail {
  code: string;
}

export interface ErrorResponse {
  errors: ErrorDetail[];
}

export const SystemRole = {
  Admin: 'ADMIN',
};

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

export interface GetUsersResponseBody {
  data: User[];
}

export interface InviteUserRequestBody {
  email: string;
  name: string;
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
