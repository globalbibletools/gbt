import BaseError from './BaseError';

export class MultiError extends Error {
  constructor(
    readonly responseType: 'invalid' | 'conflict' | 'notFound' | 'badRequest',
    readonly errors: BaseError[]
  ) {
    super('Several errors occurred');
    Object.setPrototypeOf(this, MultiError.prototype);
  }
}

export class NotFoundError extends BaseError {}
export class AlreadyExistsError extends BaseError {}
export class InvalidRequestShapeError extends BaseError {}
export class TypeMismatchError extends BaseError {}
export class IdMismatchError extends BaseError {}
