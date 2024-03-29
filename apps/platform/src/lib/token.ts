// token.ts
import { db } from "~/server/db";

import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { createId } from "@paralleldrive/cuid2";
import { type UserId } from "~/schemas/public/User";
import { generateDatabaseId } from "./id";

export const generateEmailVerificationToken = async (
  userId: UserId,
  email: string,
) => {
  await db
    .deleteFrom("email_verification")
    .where("userId", "=", userId)
    .execute();

  const code = generateRandomString(8, alphabet("0-9"));

  await db
    .insertInto("email_verification")
    .values({
      id: generateDatabaseId("email_verification"),
      userId: userId,
      email,
      code,
      expiresAt: createDate(new TimeSpan(5, "m")),
    })
    .execute();

  return code;
};

export async function createPasswordResetToken(
  userId: UserId,
): Promise<string> {
  await db
    .deleteFrom("password_reset_token")
    .where("userId", "=", userId)
    .execute();

  const token = generateRandomString(40, alphabet("0-9"));

  await db
    .insertInto("password_reset_token")
    .values({
      id: generateDatabaseId("password_reset_token"),
      userId: userId,
      token,
      expiresAt: createDate(new TimeSpan(5, "m")),
    })
    .execute();

  return token;
}
