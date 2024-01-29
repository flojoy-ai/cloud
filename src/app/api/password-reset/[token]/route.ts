import { eq } from "drizzle-orm";
import { NextResponse, type NextRequest } from "next/server";
import { isWithinExpirationDate } from "oslo";
import { Argon2id } from "oslo/password";
import { lucia } from "~/auth/lucia";
import { db } from "~/server/db";
import { userTable } from "~/server/db/schema";

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
    return NextResponse.json(
      {
        error: "Invalid password",
      },
      {
        status: 400,
      },
    );
  }

  try {
    await db.transaction(async (tx) => {
      const token = await tx.query.passwordResetTokenTable.findFirst({
        where: (fields, { eq }) => eq(fields.token, params.token),
      });

      if (!token || !isWithinExpirationDate(token.expiresAt)) {
        return new Response(null, {
          status: 400,
        });
      }

      await lucia.invalidateUserSessions(token.userId);
      const hashedPassword = await new Argon2id().hash(password);

      await db
        .update(userTable)
        .set({
          hashedPassword,
        })
        .where(eq(userTable.id, token.userId));

      const session = await lucia.createSession(token.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": sessionCookie.serialize(),
        },
      });
    });
  } catch {
    return NextResponse.json(
      {
        error: "Invalid or expired password reset link",
      },
      {
        status: 400,
      },
    );
  }
};
