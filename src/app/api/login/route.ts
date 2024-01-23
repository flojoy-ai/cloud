// app/api/login/route.ts
import { auth } from "~/auth/lucia";
import { NextResponse } from "next/server";
import { LuciaError } from "lucia";

import type { NextRequest } from "next/server";
import { z } from "zod";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

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
  if (
    typeof password !== "string" ||
    password.length < 1 ||
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
    // find user by key
    // and validate password
    const key = await auth.useKey(
      "email",
      parsedEmail.data.toLowerCase(),
      password,
    );
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {
        auth_provider: "email",
      },
    });
    const sessionCookie = auth.createSessionCookie(session);
    return new Response(null, {
      headers: {
        Location: "/", // profile page
        "Set-Cookie": sessionCookie.serialize(), // store session cookie
      },
      status: 302,
    });
  } catch (e) {
    if (
      e instanceof LuciaError &&
      (e.message === "AUTH_INVALID_KEY_ID" ||
        e.message === "AUTH_INVALID_PASSWORD")
    ) {
      // user does not exist or invalid password
      return NextResponse.json(
        {
          error: "Incorrect email or password",
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
