import { googleAuth } from "~/auth/lucia";
import * as context from "next/headers";

import { env } from "~/env";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const GET = async (_: NextRequest) => {
  const [url, state] = await googleAuth.getAuthorizationUrl();

  context.cookies().set("google_oauth_state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });

  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
};
