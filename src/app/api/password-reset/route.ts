import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { generatePasswordResetToken } from "~/lib/token";
import { sendPasswordResetLink } from "~/lib/email";
import { env } from "~/env";

export const POST = async (request: NextRequest) => {
  const formData = await request.formData();
  const email = formData.get("email");
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
    const storedUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, parsedEmail.data),
    });

    if (!storedUser) {
      return NextResponse.json(
        {
          error: "User does not exist",
        },
        {
          status: 400,
        },
      );
    }

    const token = await generatePasswordResetToken(storedUser.id);
    const resetLink = `${env.NEXT_PUBLIC_URL_ORIGIN}/password-reset/${token}`;
    await sendPasswordResetLink(storedUser.email, resetLink);
    return new Response();
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
