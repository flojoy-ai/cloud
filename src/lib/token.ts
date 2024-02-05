// token.ts
import { db } from "~/server/db";

import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { createId } from "@paralleldrive/cuid2";

export const generateEmailVerificationToken = async (
  userId: string,
  email: string,
) => {
  await db
    .deleteFrom("email_verification")
    .where("user_id", "=", userId)
    .execute();

  const code = generateRandomString(8, alphabet("0-9"));

  await db
    .insertInto("email_verification")
    .values({
      id: "ev_" + createId(),
      user_id: userId,
      email,
      code,
      expires_at: createDate(new TimeSpan(5, "m")),
    })
    .execute();

  return code;
};

export async function createPasswordResetToken(
  userId: string,
): Promise<string> {
  await db
    .deleteFrom("password_reset_token")
    .where("user_id", "=", userId)
    .execute();

  const token = generateRandomString(40, alphabet("0-9"));

  await db
    .insertInto("password_reset_token")
    .values({
      id: "ev_" + createId(),
      user_id: userId,
      token,
      expires_at: createDate(new TimeSpan(5, "m")),
    })
    .execute();

  return token;
}
