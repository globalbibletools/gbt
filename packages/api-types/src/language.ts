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
