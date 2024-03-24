import type PublicSchema from "@/schemas/public/PublicSchema";
import { createId } from "@paralleldrive/cuid2";
import { ResultAsync, fromPromise } from "neverthrow";
import { DatabaseError } from "pg";

export function generateDatabaseId(table: keyof PublicSchema) {
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

type DBError = DuplicateError | ForeignKeyError | GenericError;

// TODO: Allow overriding these error messages
type DuplicateError = {
  type: "duplicate";
  message: "Record already exists!";
};

type ForeignKeyError = {
  type: "foreign key";
  message: "Resource is in use!";
};

type GenericError = {
  type: "generic";
  message: string;
};

export function tryQuery<T>(promise: Promise<T>): ResultAsync<T, DBError> {
  return fromPromise(promise, (e) => {
    const err = e as DatabaseError;
    switch (err.code) {
      case ErrorCode.DUPLICATE:
        return {
          type: "duplicate",
          message: "Record already exists!",
        };
      case ErrorCode.FOREIGN_KEY_VIOLATION:
        return {
          type: "foreign key",
          message: "Resource is in use!",
        };
      default:
        return {
          type: "generic",
          message: err.message,
        };
    }
  });
}
