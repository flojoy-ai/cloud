import { type NextRequest } from "next/server";
import { lucia, validateRequest } from "~/auth/lucia";
import { isWithinExpirationDate } from "oslo";
import { db } from "~/server/db";

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

  await db.transaction().execute(async (tx) => {
    const emailVerification = await tx
      .selectFrom("email_verification as ev")
      .where("ev.userId", "=", user.id)
      .selectAll()
      .executeTakeFirst();

    if (emailVerification) {
      await tx
        .deleteFrom("email_verification as ev")
        .where("ev.id", "=", emailVerification.id)
        .execute();
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
        status: 400,
      });
    }
  });

  await lucia.invalidateUserSessions(user.id);

  await db
    .updateTable("user")
    .set({ emailVerified: true })
    .where("user.id", "=", user.id)
    .execute();

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
