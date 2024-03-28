import { createId } from "@paralleldrive/cuid2";
import { ResultAsync, fromPromise } from "neverthrow";
import { DatabaseError } from "pg";
import {
  DBError,
  DuplicateError,
  ForeignKeyError,
  InternalServerError,
} from "./error";
import { DB } from "@cloud/shared";

export function generateDatabaseId(table: keyof DB) {
  const cuid = createId();
  switch (table) {
    // can add more case here if we need custom handling
    // maybe like a shorter prefix or something
    default:
      return table + "_" + cuid;
  }
}

// For postgresql error codes https://www.postgresql.org/docs/current/errcodes-appendix.html
enum ErrorCode {
  DUPLICATE = "23505",
  FOREIGN_KEY_VIOLATION = "23503",
}

export function tryQuery<T>(promise: Promise<T>): ResultAsync<T, DBError> {
  return fromPromise(promise, (e) => {
    const err = e as DatabaseError;
    switch (err.code) {
      case ErrorCode.DUPLICATE:
        return new DuplicateError("Record already exists!");
      case ErrorCode.FOREIGN_KEY_VIOLATION:
        return new ForeignKeyError("Resource is in use!");
      default:
        return new InternalServerError(err.message);
    }
  });
}
