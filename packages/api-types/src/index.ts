export interface LanguageResourceIdentifier {
  type: 'language';
  id: string;
}
export interface LanguageAttributes {
  name: string;
}
export interface LanguageLinks {
  self: string;
}
export type Language = LanguageResourceIdentifier & {
  attributes: LanguageAttributes;
  links: LanguageLinks;
};

export interface GetLanguagesResponseBody {
  data: Language[];
  links: {
    self: string;
  };
}

export interface GetLanguageResponseBody {
  data: Language;
}

export interface PostLanguageRequestBody {
  data: LanguageResourceIdentifier & {
    attributes: LanguageAttributes;
  };
}

export interface PostLanguageResponseBody {
  data: Language;
}

export interface PatchLanguageRequestBody {
  data: LanguageResourceIdentifier & {
    attributes: Partial<LanguageAttributes>;
  };
}

export interface PatchLanguageResponseBody {
  data: Language;
}
