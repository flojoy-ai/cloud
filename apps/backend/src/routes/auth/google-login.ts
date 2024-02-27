import { Elysia } from "elysia";
import { google } from "~/routes/auth/lucia";

import { env } from "~/env";
import { generateCodeVerifier, generateState } from "arctic";

export const googleLoginRoute = new Elysia({ prefix: "/google/login" }).get(
  "/",
  async ({ set }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = await google.createAuthorizationURL(state, codeVerifier, {
      scopes: ["profile", "email"],
    });

    set.cookie = {
      ["google_oauth_state"]: {
        value: state,
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
        sameSite: "lax",
      },
      ["google_code_verifier"]: {
        value: codeVerifier,
        secure: true, // set to false in localhost
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 min
      },
    };

    set.redirect = url.toString();
    set.status = "Temporary Redirect";
    return null;
  }
);
