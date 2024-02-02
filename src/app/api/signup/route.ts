import { lucia } from "~/auth/lucia";
import { Argon2id } from "oslo/password";

import type { NextRequest } from "next/server";
import { z } from "zod";
import { type DatabaseError } from "@neondatabase/serverless";
import { generateEmailVerificationToken } from "~/lib/token";
import { sendEmailVerificationLink } from "~/lib/email";
import { env } from "~/env";
import { createId } from "@paralleldrive/cuid2";
import { db } from "~/server/db";
import { userTable } from "~/server/db/schema";
import { cookies } from "next/headers";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  // basic check
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return new Response("Invalid password!", {
      status: 400,
    });
  }

  const parsedEmail = z.string().email().safeParse(email);
  if (!parsedEmail.success) {
    return new Response("Looks like this is not a valid email address.", {
      status: 400,
    });
  }

  try {
    const userId = "user_" + createId();
    const hashedPassword = await new Argon2id().hash(password);

    const userExists = await db.query.userTable.findFirst({
      where: (u, { eq }) => eq(u.email, parsedEmail.data),
    });
    if (userExists) {
      return new Response("User already exists, please login!", {
        status: 400,
      });
    }

    await db.insert(userTable).values({
      id: userId,
      email: parsedEmail.data,
      hashedPassword,
      emailVerified: false,
    });

    const token = await generateEmailVerificationToken(
      userId,
      parsedEmail.data,
    );
    const verificationLink =
      env.NEXT_PUBLIC_URL_ORIGIN + "/api/email-verification/" + token;
    await sendEmailVerificationLink(parsedEmail.data, verificationLink);

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return new Response(null, {
      headers: {
        Location: "/verify", // verify page
      },
      status: 302,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // this part depends on the database you're using
    // check for unique constraint error in user table

    if ((e as DatabaseError).code === "23505") {
      return new Response(
        "Seems like this email already exists! Try logging in :)",
        { status: 400 },
      );
    }

    return new Response("Internal server error", {
      status: 500,
    });
  }
};
