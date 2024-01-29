import { type NextRequest } from "next/server";
import { validateRequest } from "~/auth/lucia";
import { sendEmailVerificationLink } from "~/lib/email";
import { generateEmailVerificationToken } from "~/lib/token";

export const POST = async (request: NextRequest) => {
  const { user } = await validateRequest();
  if (!user) {
    return new Response(null, {
      status: 401,
    });
  }
  if (user.emailVerified) {
    // email already verified
    return new Response(null, {
      status: 422,
    });
  }

  try {
    const token = await generateEmailVerificationToken(user.id, user.email);
    const verificationLink =
      request.nextUrl.origin + "/api/email-verification/" + token;
    await sendEmailVerificationLink(user.email, verificationLink);
    return new Response();
  } catch {
    return new Response("An unknown error occurred", {
      status: 500,
    });
  }
};
