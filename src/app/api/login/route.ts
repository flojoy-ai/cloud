// app/api/login/route.ts
import { Argon2id } from "oslo/password";
import { lucia } from "~/auth/lucia";

import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { cookies } from "next/headers";
import { withAppRouterHighlight } from "~/lib/highlight";

export const POST = withAppRouterHighlight(async (request: NextRequest) => {
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
    return new Response("Wrong password or user does not exist!", {
      status: 400,
    });
  }
  const existingUser = await db
    .selectFrom("user")
    .selectAll()
    .where("email", "=", parsedEmail.data)
    .executeTakeFirst();

  if (!existingUser) {
    return new Response("Wrong password or user does not exist!", {
      status: 400,
    });
  }

  if (!existingUser?.hashedPassword) {
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
    return new Response("Wrong password or user does not exist!", {
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
});
