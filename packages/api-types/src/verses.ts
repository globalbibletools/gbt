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
  gloss: string;
}

export interface GetVerseGlossesResponseBody {
  data: Gloss[];
}
