import { Elysia, t } from "elysia";
import {
  generateState,
  generateCodeVerifier,
  OAuth2RequestError,
} from "arctic";
import { google, lucia } from "@/auth/lucia";
import { env } from "@/env";
import { generateDatabaseId } from "@/db/id";
import { db } from "@/db/kysely";

export const authGoogleRoute = new Elysia({ prefix: "/auth/google" })
  .get(
    "/login",
    async ({ cookie: { google_oauth_state, google_code_verifier }, set }) => {
      const state = generateState();
      const codeVerifier = generateCodeVerifier();
      const url = await google.createAuthorizationURL(state, codeVerifier, {
        scopes: ["profile", "email"],
      });

      google_oauth_state.value = state;
      google_oauth_state.set({
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
        sameSite: "lax",
      });

      google_code_verifier.value = codeVerifier;
      google_code_verifier.set({
        secure: true, // set to false in localhost
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 min
      });

      set.redirect = url.toString();
    },
    {
      cookie: t.Cookie({
        google_oauth_state: t.String(),
        google_code_verifier: t.String(),
      }),
    },
  )
  .get(
    "/callback",
    async ({ cookie, query: { state, code }, set, error }) => {
      const storedState = cookie.google_oauth_state.value;
      const storedCodeVerifier = cookie.google_code_verifier.value;

      // Validate state
      if (
        !storedState ||
        !storedCodeVerifier ||
        !state ||
        storedState !== state ||
        !code
      ) {
        return error(400, "Bad Request");
      }

      try {
        const redirectUrl = env.WEB_URL + "/setup";
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

        const existingUser = await db
          .selectFrom("oauth_account")
          .selectAll()
          .where("providerUserId", "=", user.sub)
          .where("providerId", "=", "google")
          .executeTakeFirst();

        if (existingUser) {
          const session = await lucia.createSession(existingUser.userId, {});
          const sessionCookie = lucia.createSessionCookie(session.id);

          cookie[sessionCookie.name]?.set({
            value: sessionCookie.value,
            ...sessionCookie.attributes,
          });

          set.redirect = redirectUrl;
          return;
        }

        const userId = generateDatabaseId("user");

        await db.transaction().execute(async (tx) => {
          await tx
            .insertInto("user")
            .values({
              id: userId,
              email: user.email,
              emailVerified: user.email_verified,
            })
            .execute();

          await tx
            .insertInto("oauth_account")
            .values({
              providerId: "google",
              providerUserId: user.sub,
              userId,
            })
            .execute();
        });

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        cookie[sessionCookie.name]?.set({
          value: sessionCookie.value,
          ...sessionCookie.attributes,
        });

        set.redirect = redirectUrl;
        return;
      } catch (e) {
        console.error(e);

        if (e instanceof OAuth2RequestError) {
          // invalid code
          return error(400, "Bad Request");
        }

        return error(500, "Internal Server Error");
      }
    },
    {
      cookie: t.Cookie({
        google_oauth_state: t.String(),
        google_code_verifier: t.String(),
      }),
      query: t.Object(
        {
          state: t.String(),
          code: t.String(),
        },
        { additionalProperties: true },
      ),
    },
  );

interface GoogleUser {
  sub: string;
  email: string;
  email_verified: boolean;
  picture: string;
}
