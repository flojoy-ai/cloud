import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { createPasswordResetToken } from "~/lib/token";
import { sendPasswordResetLink } from "~/lib/email";

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
    const storedUser = await db.query.userTable.findFirst({
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

    const token = await createPasswordResetToken(storedUser.id);
    const resetLink = `${request.nextUrl.origin}/password-reset/${token}`;
    await sendPasswordResetLink(storedUser.email, resetLink);
    return new Response(null, { status: 200 });
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
