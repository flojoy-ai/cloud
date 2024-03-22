import { DatabaseError } from "pg";

// For postgresql error codes https://www.postgresql.org/docs/current/errcodes-appendix.html
export const dbErrorCodes = {
  DUPLICATE: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
} as const;

export const defaultDBErrorMsg = {
  [dbErrorCodes.DUPLICATE]: "Record already exists!",
  [dbErrorCodes.FOREIGN_KEY_VIOLATION]: "Resource is in use!",
};

export async function withDBErrorCheck<T>(
  promise: Promise<T>,
  options: {
    errorCode: keyof typeof dbErrorCodes;
    errorMsg?: string;
  },
): Promise<typeof promise> {
  try {
    return await promise;
  } catch (error) {
    const err = error as DatabaseError;
    if (err.code === dbErrorCodes[options.errorCode]) {
      throw new DatabaseError(
        options.errorMsg ?? defaultDBErrorMsg[dbErrorCodes[options.errorCode]],
        err.length,
        err.name,
      );
    }
    throw error;
  }
}
