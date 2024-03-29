import { lucia } from "~/auth/lucia";
import { Argon2id } from "oslo/password";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { generateEmailVerificationToken } from "~/lib/token";
import { sendAccountExistsEmail, sendEmailVerificationLink } from "~/lib/email";
import { env } from "~/env";
import { db } from "~/server/db";
import { cookies } from "next/headers";
import { generateDatabaseId } from "~/lib/id";

const defaultErrorMsg =
  "There was an error with your registration. Please try registering again.";

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
    const userId = generateDatabaseId("user");
    const hashedPassword = await new Argon2id().hash(password);

    const userExists = await db
      .selectFrom("user")
      .selectAll()
      .where("email", "=", parsedEmail.data)
      .executeTakeFirst();

    if (userExists) {
      await sendAccountExistsEmail(parsedEmail.data);
      return new Response(defaultErrorMsg, {
        status: 400,
      });
    }

    await db
      .insertInto("user")
      .values({
        id: userId,
        email: parsedEmail.data,
        hashedPassword: hashedPassword,
        emailVerified: false,
      })
      .execute();

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
  } catch {
    return new Response(defaultErrorMsg, {
      status: 400,
    });
  }
};
