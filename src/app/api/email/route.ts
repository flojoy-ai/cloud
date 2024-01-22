import { type NextRequest } from "next/server";
import { auth } from "~/auth/lucia";
import { sendEmailVerificationLink } from "~/lib/email";
import { generateEmailVerificationToken } from "~/lib/token";

export const POST = async (request: NextRequest) => {
  const authRequest = auth.handleRequest(request);
  const session = await authRequest.validate();
  if (!session) {
    return new Response(null, {
      status: 401,
    });
  }
  if (session.user.emailVerified) {
    // email already verified
    return new Response(null, {
      status: 422,
    });
  }

  try {
    const token = await generateEmailVerificationToken(session.user.userId);
    const verificationLink = request.nextUrl.origin + "/api/email/" + token;
    await sendEmailVerificationLink(session.user.email, verificationLink);
    return new Response();
  } catch {
    return new Response("An unknown error occurred", {
      status: 500,
    });
  }
};
