import { type NextRequest } from "next/server";
import { auth } from "~/auth/lucia";
import { validateEmailVerificationToken } from "~/lib/token";

export const GET = async (
  _: NextRequest,
  { params }: { params: { token: string } },
) => {
  const token = params.token;
  try {
    const userId = await validateEmailVerificationToken(token);
    const user = await auth.getUser(userId);
    await auth.invalidateAllUserSessions(user.userId);
    await auth.updateUserAttributes(user.userId, {
      email_verified: true, // `Number(true)` if stored as an integer
    });
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {
        auth_provider: "email",
      },
    });
    const sessionCookie = auth.createSessionCookie(session);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/", // profile page
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  } catch {
    return new Response("Invalid email verification link", {
      status: 400,
    });
  }
};
