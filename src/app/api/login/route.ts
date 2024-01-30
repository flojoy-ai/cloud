// app/api/login/route.ts
import { Argon2id } from "oslo/password";
import { lucia } from "~/auth/lucia";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { cookies } from "next/headers";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  const parsedEmail = z.string().email().safeParse(email);
  if (!parsedEmail.success) {
    return new Response("Invalid email!", {
      status: 400,
    });
  }
  if (
    typeof password !== "string" ||
    password.length < 1 ||
    password.length > 255
  ) {
    return new Response("Invalid password!", {
      status: 400,
    });
  }

  try {
    const existingUser = await db.query.userTable.findFirst({
      where: (user, { eq }) => eq(user.email, parsedEmail.data),
    });
    if (!existingUser) {
      return new Response("This user does not exist :(", {
        status: 400,
      });
    }

    if (!existingUser.hashedPassword) {
      return new Response(
        "This user does not have a password set, please try logging in with another provider.",
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
      return new Response("Wrong password!", {
        status: 400,
      });
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return new Response(null, {
      headers: {
        Location: "/workspace",
      },
      status: 302,
    });
  } catch (e) {
    return new Response("Internal server error", {
      status: 500,
    });
  }
};
