import { type NextRequest } from "next/server";
import * as jose from "jose";
import { env } from "~/env";
import { z } from "zod";
export class ErrorWithCode extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}
export const zapierUserAuthMiddleware = async (req: NextRequest) => {
  const authorization = req.headers.get("Authorization");
  const jwt = authorization?.replace("Bearer ", "");
  if (!jwt) {
    throw new ErrorWithCode("missing JWT!", 401);
  }
  const { payload } = await jose.jwtVerify(
    jwt,
    new TextEncoder().encode(env.JWT_SECRET),
  );

  if (!payload) {
    throw new ErrorWithCode("the given JWT is invalid", 401);
  }
  const parsed = z
    .object({
      userId: z.string().startsWith("user_"),
      workspaceId: z.string().startsWith("workspace_"),
    })
    .safeParse(payload);

  if (!parsed.success) {
    throw new ErrorWithCode("the given JWT is invalid, parsing failed", 401);
  }

  return parsed.data;
};
