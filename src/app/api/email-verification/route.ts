import { validateRequest } from "~/auth/lucia";
import { env } from "~/env";
import { sendEmailVerificationLink } from "~/lib/email";
import { generateEmailVerificationToken } from "~/lib/token";
import { type UserId } from "~/schemas/public/User";
import { withAppRouterHighlight } from "~/lib/highlight";

export const POST = withAppRouterHighlight(async () => {
  const { user } = await validateRequest();
  if (!user) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  if (user.emailVerified) {
    // email already verified
    return new Response("Email already verified", {
      status: 422,
    });
  }

  try {
    const token = await generateEmailVerificationToken(user.id, user.email);
    const verificationLink = `${env.NEXT_PUBLIC_URL_ORIGIN}/api/email-verification/${token}`;
    await sendEmailVerificationLink(user.email, verificationLink);
    return new Response("Verification email sent to " + user.email, {
      status: 200,
    });
  } catch (e) {
    return new Response("Failed to send verification email!", {
      status: 400,
    });
  }
});
