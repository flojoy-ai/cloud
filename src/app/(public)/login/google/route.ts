import { google } from "~/auth/lucia";

import { env } from "~/env";
import type { NextRequest } from "next/server";
import { generateCodeVerifier, generateState } from "arctic";
import { cookies } from "next/headers";

export const GET = async (_: NextRequest) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  cookies().set("google_oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
    sameSite: "lax",
  });

  cookies().set("google_code_verifier", codeVerifier, {
    secure: true, // set to false in localhost
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  return Response.redirect(url);
};
