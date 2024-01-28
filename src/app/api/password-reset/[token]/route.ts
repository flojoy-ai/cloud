import { NextResponse, type NextRequest } from "next/server";
import { auth } from "~/auth/lucia";
import { validatePasswordResetToken } from "~/lib/token";

export const POST = async (
  request: NextRequest,
  {
    params,
  }: {
    params: {
      token: string;
    };
  },
) => {
  const formData = await request.formData();
  const password = formData.get("password");

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 255
  ) {
    return NextResponse.json(
      {
        error: "Invalid password",
      },
      {
        status: 400,
      },
    );
  }
  try {
    const { token } = params;
    const userId = await validatePasswordResetToken(token);
    let user = await auth.getUser(userId);
    await auth.invalidateAllUserSessions(user.userId);
    await auth.updateKeyPassword("email", user.email, password);
    if (!user.emailVerified) {
      user = await auth.updateUserAttributes(user.userId, {
        email_verified: true,
      });
    }
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
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Invalid or expired password reset link",
      },
      {
        status: 400,
      },
    );
  }
};
