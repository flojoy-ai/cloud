import { z } from "zod";
import { type NextRequest } from "next/server";
import { db } from "~/server/db";
import { createPasswordResetToken } from "~/lib/token";
import { sendPasswordResetLink } from "~/lib/email";
import { env } from "~/env";
import { withAppRouterHighlight } from "~/lib/highlight";

export const POST = withAppRouterHighlight(async (request: NextRequest) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const parsedEmail = z.string().email().safeParse(email);
  if (!parsedEmail.success) {
    return new Response("Invalid email!", {
      status: 400,
    });
  }

  try {
    const storedUser = await db
      .selectFrom("user")
      .selectAll()
      .where("email", "=", parsedEmail.data)
      .executeTakeFirst();

    if (!storedUser) {
      return new Response(
        "A password reset email will be sent if you have a Flojoy Cloud account. Please check your inbox :)",
        {
          status: 200,
        },
      );
    }

    const token = await createPasswordResetToken(storedUser.id);
    const resetLink = `${env.NEXT_PUBLIC_URL_ORIGIN}/password-reset/${token}`;
    await sendPasswordResetLink(storedUser.email, resetLink);

    return new Response(
      "A password reset email will be sent if you have a Flojoy Cloud account. Please check your inbox :)",
      {
        status: 200,
      },
    );
  } catch (e) {
    return new Response(String(e), {
      status: 400,
    });
  }
});
