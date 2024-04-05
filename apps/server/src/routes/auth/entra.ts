import { Elysia, t } from "elysia";
import {
  generateState,
  generateCodeVerifier,
  OAuth2RequestError,
} from "arctic";
import { entra, lucia } from "../../auth/lucia";
import { env } from "../../env";
import { generateDatabaseId } from "../../lib/db-utils";
import { db } from "../../db/kysely";
import { getUrlFromUri } from "../../lib/url";

export const AuthEntraRoute = new Elysia({
  prefix: "/auth/entra",
  name: "AuthEntraRoute",
})
  .get(
    "/login",
    async ({ cookie: { entra_oauth_state, entra_code_verifier }, set }) => {
      const state = generateState();
      const codeVerifier = generateCodeVerifier();
      const url = await entra.createAuthorizationURL(state, codeVerifier, {
        scopes: ["profile", "email"],
      });

      entra_oauth_state.value = state;
      entra_oauth_state.set({
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60,
        sameSite: "lax",
      });

      entra_code_verifier.value = codeVerifier;
      entra_code_verifier.set({
        secure: true, // set to false in localhost
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 min
      });

      set.redirect = url.toString();
    },
    {
      cookie: t.Cookie({
        entra_oauth_state: t.String(),
        entra_code_verifier: t.String(),
      }),
    },
  )
  .get(
    "/callback",
    async ({ cookie, query: { state, code }, set, error }) => {
      const storedState = cookie.entra_oauth_state.value;
      const storedCodeVerifier = cookie.entra_code_verifier.value;

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
        const redirectUrl = getUrlFromUri(env.WEB_URI) + "/setup";
        const tokens = await entra.validateAuthorizationCode(
          code,
          storedCodeVerifier,
        );
        const response = await fetch(
          "https://graph.microsoft.com/oidc/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokens.accessToken}`,
            },
          },
        );
        const user = (await response.json()) as EntraUser;

        const existingUser = await db
          .selectFrom("oauth_account")
          .selectAll()
          .where("providerUserId", "=", user.sub)
          .where("providerId", "=", "entra")
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
              providerId: "entra_id",
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
        entra_oauth_state: t.String(),
        entra_code_verifier: t.String(),
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

interface EntraUser {
  sub: string;
  email: string;
  email_verified: boolean;
  picture: string;
}
