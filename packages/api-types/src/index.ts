export * from './language';
export * from './verses';

export interface ErrorDetail {
  code: string;
}

export interface ErrorResponse {
  errors: ErrorDetail[];
}
