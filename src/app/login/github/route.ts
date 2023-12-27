import { githubAuth } from "~/auth/lucia";
import * as context from "next/headers";

import type { NextRequest } from "next/server";

export const GET = async (_: NextRequest) => {
  const [url, state] = await githubAuth.getAuthorizationUrl();

  context.cookies().set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
