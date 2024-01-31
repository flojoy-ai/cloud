import { type NextRequest } from "next/server";
import { lucia, validateRequest } from "~/auth/lucia";
import { isWithinExpirationDate } from "oslo";
import { db } from "~/server/db";
import { emailVerificationTable, userTable } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const GET = async (
  _: NextRequest,
  { params }: { params: { code: string } },
) => {
  const code = params.code;
  const { user } = await validateRequest();
  if (!user) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  // check for length
  if (typeof code !== "string" || code.length !== 8) {
    return new Response("Invalid verification code!", {
      status: 400,
    });
  }

  await db.transaction(async (tx) => {
    const emailVerification = await tx.query.emailVerificationTable.findFirst({
      where: (fields, { eq }) => eq(fields.userId, user.id),
    });
    if (emailVerification) {
      await db
        .delete(emailVerificationTable)
        .where(eq(emailVerificationTable.id, emailVerification.id));
    }

    if (!emailVerification || emailVerification.code !== code) {
      return new Response("Invalid verification code!", {
        status: 400,
      });
    }
    if (!isWithinExpirationDate(emailVerification.expiresAt)) {
      return new Response("Verification code expired!", {
        status: 400,
      });
    }
    if (user.email !== emailVerification.email) {
      return new Response("Invalid verification code!", {
        status: 422,
      });
    }
  });

  await lucia.invalidateUserSessions(user.id);

  await db
    .update(userTable)
    .set({ emailVerified: true })
    .where(eq(userTable.id, user.id));

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": sessionCookie.serialize(),
    },
  });
};
