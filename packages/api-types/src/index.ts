export * from './language';

export interface ErrorDetail {
  code: string;
}

export interface ErrorResponse {
  errors: ErrorDetail[];
}
