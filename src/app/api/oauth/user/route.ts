import { type NextRequest } from "next/server";
import * as jose from "jose";
import { env } from "~/env";
import { z } from "zod";

export const GET = async (req: NextRequest) => {
  const authorization = req.headers.get("Authorization");
  const jwt = authorization?.replace("Bearer ", "");
  if (!jwt) {
    return new Response(null, {
      status: 401,
    });
  }
  const { payload } = await jose.jwtVerify(
    jwt,
    new TextEncoder().encode(env.JWT_SECRET),
  );

  if (!payload) {
    return new Response(
      JSON.stringify({ message: "the given JWT is invalid" }),
      {
        status: 401,
      },
    );
  }
  const parsed = z
    .object({
      userId: z.string().startsWith("user_"),
      workspaceId: z.string().startsWith("workspace_"),
    })
    .safeParse(payload);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        message: "the given JWT is invalid, parsing failed",
      }),
      {
        status: 401,
      },
    );
  }

  const { userId, workspaceId } = parsed.data;
  return new Response(JSON.stringify({ userId, workspaceId }), {
    status: 200,
  });
};
