import { auth, googleAuth } from "~/auth/lucia";
import { OAuthRequestError } from "@lucia-auth/oauth";
import { cookies, headers } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const storedState = cookies().get("google_oauth_state")?.value;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // Validate state
  if (!storedState || !state || storedState !== state || !code) {
    return new NextResponse(null, {
      status: 400,
    });
  }

  try {
    const { getExistingUser, googleUser, createUser } =
      await googleAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;

      const user = await createUser({
        userId: "user_" + createId(),
        attributes: {
          email_verified: true,
          email: googleUser.email ?? "",
        },
      });
      return user;
    };

    const user = await getUser();

    const session = await auth.createSession({
      userId: user.userId,
      attributes: {
        auth_provider: "google",
      },
    });

    const authRequest = auth.handleRequest(request.method, {
      cookies,
      headers,
    });
    authRequest.setSession(session);

    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: "/", // redirect to profile page
      },
    });
  } catch (e) {
    console.error(e);

    if (e instanceof OAuthRequestError) {
      // invalid code
      return new NextResponse(null, {
        status: 400,
      });
    }

    return new NextResponse(null, {
      status: 500,
    });
  }
};
