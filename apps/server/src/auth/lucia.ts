import { Lucia } from "lucia";
import { MicrosoftEntraId } from "arctic";

import { env } from "@/env";
import { Google } from "arctic";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { pool } from "@/db/kysely";

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

  getSessionAttributes: () => {
    return {};
  },
});

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI,
);

export const entra = new MicrosoftEntraId(
  env.ENTRA_ID_TENANT_ID,
  env.ENTRA_ID_CLIENT_ID,
  env.ENTRA_ID_CLIENT_SECRET,
  env.ENTRA_ID_REDIRECT_URI,
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
