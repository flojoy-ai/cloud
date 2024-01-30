import { lucia, google } from "~/auth/lucia";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { OAuth2RequestError } from "arctic";
import { db } from "~/server/db";
import { oauthAccountTable, userTable } from "~/server/db/schema";

export const GET = async (request: NextRequest) => {
  const storedState = cookies().get("google_oauth_state")?.value;
  const storedCodeVerifier = cookies().get("google_code_verifier")?.value;
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // Validate state
  if (
    !storedState ||
    !storedCodeVerifier ||
    !state ||
    storedState !== state ||
    !code
  ) {
    return new NextResponse(null, {
      status: 400,
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );
    const user = (await response.json()) as GoogleUser;
    const existingUser = await db.query.oauthAccountTable.findFirst({
      where: (table, { eq, and }) =>
        and(eq(table.providerUserId, user.sub), eq(table.providerId, "google")),
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
      return new NextResponse(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const userId = "user_" + createId();
    await db.transaction(async (tx) => {
      await tx.insert(userTable).values({
        id: userId,
        email: user.email,
        emailVerified: user.email_verified,
      });
      await tx.insert(oauthAccountTable).values({
        providerId: "google",
        providerUserId: user.sub,
        userId,
      });
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    console.error(e);

    if (e instanceof OAuth2RequestError) {
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

interface GoogleUser {
  sub: string;
  email: string;
  email_verified: boolean;
  picture: string;
}
