import { type NextRequest } from "next/server";
import { isWithinExpirationDate } from "oslo";
import { Argon2id } from "oslo/password";
import { lucia } from "~/auth/lucia";
import { db } from "~/server/db";

export const POST = async (
  request: NextRequest,
  {
    params,
  }: {
    params: {
      token: string;
    };
  },
) => {
  const formData = await request.formData();
  const password = formData.get("password");

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 255
  ) {
    return new Response("Invalid password!", {
      status: 400,
    });
  }

  try {
    const token = await db
      .selectFrom("password_reset_token")
      .where("token", "=", params.token)
      .selectAll()
      .executeTakeFirst();

    if (!token || !isWithinExpirationDate(token.expiresAt)) {
      return new Response("Invalid or expired password reset link", {
        status: 400,
      });
    }

    await lucia.invalidateUserSessions(token.userId);
    const hashedPassword = await new Argon2id().hash(password);

    await db
      .updateTable("user")
      .set({
        hashedPassword,
      })
      .where("id", "=", token.userId)
      .execute();

    const session = await lucia.createSession(token.userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  } catch (e) {
    return new Response(String(e), {
      status: 400,
    });
  }
};
