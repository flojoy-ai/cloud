import { lucia } from "lucia";
import { nextjs_future } from "lucia/middleware";
import { postgres as postgresAdapter } from "@lucia-auth/adapter-postgresql";
import { client } from "~/server/db";
import { auth0 } from "@lucia-auth/oauth/providers";
import { env } from "~/env";
// import "lucia/polyfill/node"; // not needed for nodejs 20 or above

export const auth = lucia({
  env: env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: nextjs_future(),
  sessionCookie: {
    expires: false,
  },
  adapter: postgresAdapter(client, {
    user: "cloud_user",
    key: "cloud_user_key",
    session: "cloud_user_session",
  }),

  getUserAttributes: (_) => {
    return {};
  },
});

export const auth0Auth = auth0(auth, {
  clientId: env.AUTH0_CLIENT_ID,
  clientSecret: env.AUTH0_CLIENT_SECRET,
  redirectUri:
    env.AUTH0_REDIRECT_URI ??
    "https://" + env.VERCEL_URL + "/login/auth0/callback",
  appDomain: env.AUTH0_APP_DOMAIN,
});

export type Auth = typeof auth;
