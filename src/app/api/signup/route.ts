import { auth } from "~/auth/lucia";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { z } from "zod";
import { DatabaseError } from "@neondatabase/serverless";
import { generateEmailVerificationToken } from "~/lib/token";
import { sendEmailVerificationLink } from "~/lib/email";

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
    const user = await auth.createUser({
      key: {
        providerId: "email", // auth method
        providerUserId: parsedEmail.data.toLowerCase(), // unique id when using "username" auth method
        password, // hashed by Lucia
      },
      attributes: {
        email: parsedEmail.data.toLowerCase(),
        email_verified: false,
      },
    });
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {
        auth_provider: "email",
      },
    });

    const token = await generateEmailVerificationToken(user.userId);

    const verificationLink = request.nextUrl.origin + "/api/email/" + token;
    await sendEmailVerificationLink(session.user.email, verificationLink);

    const sessionCookie = auth.createSessionCookie(session);
    return new Response(null, {
      headers: {
        Location: "/", // profile page
        "Set-Cookie": sessionCookie.serialize(), // store session cookie
      },
      status: 302,
    });
  } catch (e) {
    // this part depends on the database you're using
    // check for unique constraint error in user table
    if (
      e instanceof DatabaseError &&
      e.message ===
        'duplicate key value violates unique constraint "flojoy_user_email_unique"'
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
        error: "An unknown error occurred",
      },
      {
        status: 500,
      },
    );
  }
};