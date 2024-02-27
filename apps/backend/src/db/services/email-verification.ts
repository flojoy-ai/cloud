import { isWithinExpirationDate } from "oslo";
import { db } from "..";

export const emailVerificationDbTransaction = async (
  userId: string,
  userEmail: string,
  code: string
) => {
  return await db.transaction().execute(async (tx) => {
    const emailVerification = await tx
      .selectFrom("email_verification as ev")
      .where("ev.userId", "=", userId)
      .selectAll()
      .executeTakeFirst();

    if (
      !emailVerification ||
      emailVerification.code !== code ||
      !isWithinExpirationDate(emailVerification.expiresAt) ||
      userEmail !== emailVerification.email
    ) {
      throw new Error("Invalid verification code");
    }
    await tx
      .deleteFrom("email_verification as ev")
      .where("ev.id", "=", emailVerification.id)
      .execute();
  });
};
