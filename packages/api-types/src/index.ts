export interface LanguageResourceIdentifier {
  type: 'language';
  id: string;
}

export interface Language extends LanguageResourceIdentifier {
  attributes: {
    name: string;
  };
}

export interface LanguageWithLinks extends Language {
  links: {
    self: string;
  };
}

export interface GetLanguagesResponseBody {
  data: LanguageWithLinks[];
  links: {
    self: string;
  };
}

export interface GetLanguageResponseBody {
  data: LanguageWithLinks;
}

export interface PostLanguageRequestBody {
  data: Language;
}

export interface PostLanguageResponseBody {
  data: LanguageWithLinks;
}

export interface PatchLanguageRequestBody {
  data: Language;
}

export interface PatchLanguageResponseBody {
  data: LanguageWithLinks;
}
