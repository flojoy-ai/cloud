// token.ts
import { eq } from "drizzle-orm";
import { generateRandomString, isWithinExpiration } from "lucia/utils";
import { db } from "~/server/db";
import { email_verification, password_reset_token } from "~/server/db/schema";

const EXPIRES_IN = 1000 * 60 * 60 * 2; // 2 hours

export const generateEmailVerificationToken = async (userId: string) => {
  const storedUserTokens = await db.query.email_verification.findMany({
    where: (email_verification, { eq }) =>
      eq(email_verification.userId, userId),
  });
  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find((token) => {
      // check if expiration is within 1 hour
      // and reuse the token if true
      return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
    });
    if (reusableStoredToken) return reusableStoredToken.id;
  }
  const token = generateRandomString(63);
  await db.insert(email_verification).values({
    id: token,
    expires: new Date(new Date().getTime() + EXPIRES_IN),
    userId: userId,
  });

  return token;
};

export const validateEmailVerificationToken = async (token: string) => {
  const storedToken = await db.transaction(async (tx) => {
    const storedToken = await tx.query.email_verification.findFirst({
      where: (email_verification, { eq }) => eq(email_verification.id, token),
    });
    if (!storedToken) throw new Error("Invalid token");
    await tx
      .delete(email_verification)
      .where(eq(email_verification.userId, storedToken.userId));
    return storedToken;
  });
  const tokenExpires = Number(storedToken.expires); // bigint => number conversion
  if (!isWithinExpiration(tokenExpires)) {
    throw new Error("Expired token");
  }
  return storedToken.userId;
};

export const generatePasswordResetToken = async (userId: string) => {
  const storedUserTokens = await db.query.password_reset_token.findMany({
    where: (fields, { eq }) => eq(fields.userId, userId),
  });

  if (storedUserTokens.length > 0) {
    const reusableStoredToken = storedUserTokens.find((token) => {
      // check if expiration is within 1 hour
      // and reuse the token if true
      return isWithinExpiration(Number(token.expires) - EXPIRES_IN / 2);
    });
    if (reusableStoredToken) return reusableStoredToken.id;
  }
  const token = generateRandomString(63);
  await db.insert(password_reset_token).values({
    id: token,
    expires: new Date().getTime() + EXPIRES_IN,
    userId: userId,
  });

  return token;
};

export const validatePasswordResetToken = async (token: string) => {
  const storedToken = await db.transaction(async (trx) => {
    const storedToken = await trx.query.password_reset_token.findFirst({
      where: (fields, { eq }) => eq(fields.id, token),
    });
    if (!storedToken) throw new Error("Invalid token");
    await trx
      .delete(password_reset_token)
      .where(eq(password_reset_token.id, token));
    return storedToken;
  });
  const tokenExpires = Number(storedToken.expires); // bigint => number conversion
  if (!isWithinExpiration(tokenExpires)) {
    throw new Error("Expired token");
  }
  return storedToken.userId;
};

export const isValidPasswordResetToken = async (token: string) => {
  const storedToken = await db.query.password_reset_token.findFirst({
    where: (fields, { eq }) => eq(fields.id, token),
  });

  if (!storedToken) return false;
  const tokenExpires = Number(storedToken.expires); // bigint => number conversion
  if (!isWithinExpiration(tokenExpires)) {
    return false;
  }
  return true;
};
