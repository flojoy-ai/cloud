import { lucia } from "~/auth/lucia";
import { NextResponse } from "next/server";
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
import { redirect } from "next/navigation";

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
    return NextResponse.json(
      {
        error: "Invalid password",
      },
      {
        status: 400,
      },
    );
  }

  const parsedEmail = z.string().email().safeParse(email);
  if (!parsedEmail.success) {
    return NextResponse.json(
      {
        error: "Invalid email",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const userId = "user_" + createId();
    const hashedPassword = await new Argon2id().hash(password);

    // TODO: check if the user already exists
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

    if (
      (e as DatabaseError).message.includes(
        "duplicate key value violates unique constraint",
      )
    ) {
      return NextResponse.json(
        {
          error: "Email already taken",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        error: "An unknown error occurred: " + String(e),
      },
      {
        status: 500,
      },
    );
  }
};
