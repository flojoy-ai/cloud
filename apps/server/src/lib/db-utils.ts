import { DB } from "@cloud/shared";
import { createId } from "@paralleldrive/cuid2";
import { Transaction } from "kysely";
import { Result, ResultAsync, fromPromise } from "neverthrow";
import { DatabaseError } from "pg";
import { db } from "../db/kysely";
import {
  DBError,
  DuplicateError,
  ForeignKeyError,
  InternalServerError,
} from "./error";

export function fromTransaction<T, E>(
  callback: (tx: Transaction<DB>) => Promise<Result<T, E>>,
): ResultAsync<T, E> {
  return fromPromise(
    db.transaction().execute(async (tx) => {
      const res = await callback(tx);
      return res.match(
        (v) => v,
        (e) => {
          throw e;
        },
      );
    }),
    (e) => e as E,
  );
}

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
        return new DuplicateError(err.message);
      case ErrorCode.FOREIGN_KEY_VIOLATION:
        return new ForeignKeyError(err.message);
      default:
        return new InternalServerError(err.message);
    }
  });
}
