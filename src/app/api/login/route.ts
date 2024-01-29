// app/api/login/route.ts
import { Argon2id } from "oslo/password";
import { lucia } from "~/auth/lucia";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

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
    const existingUser = await db.query.userTable.findFirst({
      where: (user, { eq }) => eq(user.email, parsedEmail.data),
    });
    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User does not exist",
        },
        {
          status: 400,
        },
      );
    }

    if (!existingUser.hashedPassword) {
      return NextResponse.json(
        {
          error:
            "User does not have a password, please login with another provider",
        },
        {
          status: 400,
        },
      );
    }

    const validPassword = await new Argon2id().verify(
      existingUser.hashedPassword,
      password,
    );

    if (!validPassword) {
      return NextResponse.json(
        {
          error: "Invalid password",
        },
        {
          status: 400,
        },
      );
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return redirect("/");
  } catch (e) {
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
