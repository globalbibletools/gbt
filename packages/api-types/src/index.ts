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

export const EmailStatus = makeEnum({
  Unverified: 'UNVERIFIED',
  Verified: 'VERIFIED',
  Bounced: 'BOUNCED',
  Complained: 'COMPLAINED',
});
export type EmailStatus = typeof EmailStatus[keyof typeof EmailStatus];

export interface PostEmailVerificationRequest {
  token: string;
}

export interface GetSessionResponse {
  user?: {
    id: string;
    name?: string;
    email?: string;
    systemRoles: SystemRole[];
    languages: { code: string; roles: LanguageRole[] }[];
  };
}

export interface PostLoginRequest {
  email: string;
  password: string;
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
  password: string;
}

export interface PostForgotPasswordRequestBody {
  email: string;
}

export interface PostResetPasswordRequestBody {
  token: string;
  password: string;
}

export interface GetUsersResponseBody {
  data: {
    id: string;
    name?: string;
    email?: string;
    systemRoles?: SystemRole[];
    emailStatus?: EmailStatus;
  }[];
}

export interface PostUserRequestBody {
  email: string;
  systemRoles?: SystemRole[];
}

export interface UpdateUserRequestBody {
  email?: string;
  name?: string;
  password?: string;
  systemRoles?: SystemRole[];
}

export const TextDirection = makeEnum({
  RTL: 'rtl',
  LTR: 'ltr',
});
export type TextDirection = typeof TextDirection[keyof typeof TextDirection];

export interface Language {
  code: string;
  name: string;
  font: string;
  textDirection: TextDirection;
  bibleTranslationIds: string[];
}

export interface GetLanguagesResponseBody {
  data: Language[];
}

export interface GetLanguageResponseBody {
  data: Language;
}

export interface BookProgress {
  name: string;
  wordCount: number;
  approvedCount: number;
}

export interface GetLanguageProgressResponseBody {
  data: BookProgress[];
}

export type PostLanguageRequestBody = Pick<Language, 'code' | 'name'>;

export interface PostLanguageImportRequestBody {
  import: string;
}

export interface LanguageProgress {
  code: string;
  ot: { progress: number; words: number };
  nt: { progress: number; words: number };
}

export interface GetLanguagesProgressResponseBody {
  data: LanguageProgress[];
}

export interface GetLanguageImportResponseBody {
  startDate: string;
  endDate?: string;
  succeeded?: boolean;
}

export type PatchLanguageRequestBody = Partial<Omit<Language, 'code'>>;

export interface GetLanguageImportOptionsResponseBody {
  data: string[];
}

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
}

export interface PatchLanguageMemberRequestBody {
  roles: LanguageRole[];
}

export interface VerseWord {
  id: string;
  text: string;
  lemmaId: string;
  formId: string;
  grammar: string;
  referenceGloss?: string;
}

export interface Verse {
  id: string;
  words: VerseWord[];
}

export interface GetVerseResponseBody {
  data: Verse;
}

export const GlossState = makeEnum({
  Approved: 'APPROVED',
  Unapproved: 'UNAPPROVED',
});

export type GlossState = typeof GlossState[keyof typeof GlossState];

export const GlossSource = makeEnum({
  User: 'USER',
  Import: 'IMPORT',
});
export type GlossSource = typeof GlossSource[keyof typeof GlossSource];

export interface PhraseNote {
  content: string;
  authorName: string;
  timestamp: string;
}

export interface PhraseGloss {
  text?: string;
  state: GlossState;
}

export interface VersePhrase {
  id: number;
  wordIds: string[];
  footnote?: PhraseNote;
  translatorNote?: PhraseNote;
  gloss?: PhraseGloss;
}

export interface GetVersePhrasesResponseBody {
  data: VersePhrase[];
}

export interface VerseWordSuggestion {
  wordId: string;
  suggestions: string[];
  machineGloss?: string;
}

export interface GetVerseSuggestionsResponseBody {
  data: VerseWordSuggestion[];
}

export interface PostPhraseRequestBody {
  wordIds: string[];
}

export interface PostBulkGlossesRequestBody {
  data: { phraseId: number; gloss?: string; state?: GlossState }[];
}

export interface PatchPhraseGlossRequestBody {
  gloss?: string;
  state?: GlossState;
}

export interface PatchPhraseTranslatorNoteRequestBody {
  note: string;
}

export interface PatchPhraseFootnoteRequestBody {
  note: string;
}

export interface SNSConfirmSubscriptionMessage {
  Type: 'SubscriptionConfirmation';
  SubscribeURL: string;
  Token: string;
  TopicArn: string;
}

export interface SNSNotificationMessage {
  Type: 'Notification';
  TopicArn: string;
  Message: string;
}

export type SNSMessage = SNSConfirmSubscriptionMessage | SNSNotificationMessage;

export interface Resource {
  resource: string;
  entry: string;
}

export interface GetLemmaResourcesResponseBody {
  data: Record<string, Resource[]>;
}

export interface GetNextUnapprovedVerseResponseBody {
  nextUnapprovedVerseId?: string;
}
