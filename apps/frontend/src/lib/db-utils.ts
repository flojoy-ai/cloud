import { TRPCError } from "@trpc/server";
import { DatabaseError } from "pg";
import { z } from "zod";

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
      throw new TRPCError({
        code: "CONFLICT",
        message:
          options.errorMsg ??
          defaultDBErrorMsg[dbErrorCodes[options.errorCode]],
      });
    }
    throw error;
  }
}

export function paginated<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    startCursor: z.string().optional(),
    endCursor: z.string().optional(),
    hasNextPage: z.boolean().optional(),
    hasPrevPage: z.boolean().optional(),
    rows: z.array(schema),
  });
}

export type Paginated<T> = {
  startCursor?: string;
  endCursor?: string;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  rows: T[];
};
