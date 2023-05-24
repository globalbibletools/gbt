import { ErrorDetail } from '@translation/api-types';

/**
 * Base class for errors. Generates a code based on the error name.
 */
export default class BaseError extends Error {
  readonly code: string;

  constructor() {
    super();
    this.code = this.constructor.name.replace(/Error$/, '');
    this.message = this.code;
  }

  toErrorDetail(): ErrorDetail {
    return {
      code: this.code,
    };
  }
}
