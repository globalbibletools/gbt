import BaseError from './BaseError';

export class NotFoundError extends BaseError {}
export class AlreadyExistsError extends BaseError {}
export class InvalidRequestShapeError extends BaseError {}
export class ForbiddenError extends BaseError {}
export class InvalidTokenError extends BaseError {}
