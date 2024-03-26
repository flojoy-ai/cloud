class ErrorBase extends Error {
  message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class BadRequestError extends ErrorBase {
  code = 400;
}

export class NotFoundError extends ErrorBase {
  code = 404;
}

export class DuplicateError extends ErrorBase {
  code = 409;
}

export class ForeignKeyError extends ErrorBase {
  code = 409;
}

export class InternalServerError extends ErrorBase {
  code = 500;
}

export type DBError = DuplicateError | ForeignKeyError | InternalServerError;
export type RouteError = BadRequestError | NotFoundError | DBError;
