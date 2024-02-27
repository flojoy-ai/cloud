import { Lucia } from "lucia";

import { env } from "~/env";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { pool } from "~/db";
import { Google } from "arctic";

const adapter = new NodePostgresAdapter(pool, {
  user: "user",
  session: "user_session",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: env.NODE_ENV === "production",
    },
  },

  getUserAttributes: (user) => {
    return {
      emailVerified: user.email_verified,
      email: user.email,
    };
  },

  getSessionAttributes: (_) => {
    return {};
  },
});

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes {
  email_verified: boolean;
  email: string;
}
