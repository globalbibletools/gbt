export * from './language';

export interface Error {
  code: string;
}

export interface ErrorResponse {
  errors: Error[];
}
