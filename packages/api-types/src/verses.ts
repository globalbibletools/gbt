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
