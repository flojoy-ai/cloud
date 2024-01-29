// token.ts
import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
  emailVerificationTable,
  passwordResetTokenTable,
} from "~/server/db/schema";

import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";

export const generateEmailVerificationToken = async (
  userId: string,
  email: string,
) => {
  await db
    .delete(emailVerificationTable)
    .where(eq(emailVerificationTable.userId, userId));

  const code = generateRandomString(8, alphabet("0-9"));

  await db.insert(emailVerificationTable).values({
    userId,
    email,
    code,
    expiresAt: createDate(new TimeSpan(5, "m")),
  });

  return code;
};

export async function createPasswordResetToken(
  userId: string,
): Promise<string> {
  await db
    .delete(passwordResetTokenTable)
    .where(eq(passwordResetTokenTable.userId, userId));

  const token = generateRandomString(40, alphabet("0-9"));

  await db.insert(passwordResetTokenTable).values({
    userId,
    token,
    expiresAt: createDate(new TimeSpan(5, "m")),
  });

  return token;
}
