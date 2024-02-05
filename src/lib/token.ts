// token.ts
import { db } from "~/server/db";

import { TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { createId } from "@paralleldrive/cuid2";
import { type UserId } from "~/schemas/public/User";
import { type EmailVerificationId } from "~/schemas/public/EmailVerification";
import { type PasswordResetTokenId } from "~/schemas/public/PasswordResetToken";

export const generateEmailVerificationToken = async (
  userId: UserId,
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
      id: ("ev_" + createId()) as EmailVerificationId,
      user_id: userId,
      email,
      code,
      expires_at: createDate(new TimeSpan(5, "m")),
    })
    .execute();

  return code;
};

export async function createPasswordResetToken(
  userId: UserId,
): Promise<string> {
  await db
    .deleteFrom("password_reset_token")
    .where("user_id", "=", userId)
    .execute();

  const token = generateRandomString(40, alphabet("0-9"));

  await db
    .insertInto("password_reset_token")
    .values({
      id: ("ev_" + createId()) as PasswordResetTokenId,
      user_id: userId,
      token,
      expires_at: createDate(new TimeSpan(5, "m")),
    })
    .execute();

  return token;
}
