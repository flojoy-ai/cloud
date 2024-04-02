import { t } from "elysia";
import { env } from "../env";
import * as jose from "jose";
import { Value } from "@sinclair/typebox/value";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

const jwtValueSchema = t.Object({
  userId: t.String(),
  workspaceId: t.String(),
});

export async function generateWorkpspacePersonalAccessToken(config: {
  userId: string;
  workspaceId: string;
}): Promise<string> {
  const jwtValue = await new jose.SignJWT({
    userId: config.userId,
    workspaceId: config.workspaceId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(new Date())
    .sign(jwtSecret);
  return jwtValue;
}

export async function decryptWorkspacePersonalAccessToken(
  personalAccessToken: string,
): Promise<{
  userId: string;
  workspaceId: string;
}> {
  const { payload } = await jose.jwtVerify(
    personalAccessToken,
    new TextEncoder().encode(env.JWT_SECRET),
    {},
  );

  if (Value.Check(jwtValueSchema, payload)) {
    return {
      userId: payload.userId,
      workspaceId: payload.workspaceId,
    };
  } else {
    throw new Error("Invalid JWT");
  }
}
