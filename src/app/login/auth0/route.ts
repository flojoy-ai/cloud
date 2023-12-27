import { auth0Auth } from "~/auth/lucia";
import * as context from "next/headers";

import { env } from "~/env";
import type { NextRequest } from "next/server";

export const GET = async (_: NextRequest) => {
  const [url, state] = await auth0Auth.getAuthorizationUrl();

  context.cookies().set("auth0_oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
};
