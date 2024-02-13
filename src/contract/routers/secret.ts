import { secret } from "~/schemas/public/Secret";
import { c } from "../root";
import { z } from "zod";

export const secretContract = c.router({
  createSecret: {
    method: "POST",
    path: "/v1/secret",
    responses: {
      201: secret,
    },
    query: z.object({
      workspaceId: z.string(),
    }),
    body: z.object({}),
    summary: "Create a workspace secret",
  },
  getSecret: {
    method: "GET",
    path: `/v1/secret`,
    query: z.object({
      workspaceId: z.string(),
    }),
    responses: {
      200: secret.optional(),
    },
    summary: "Get the workspace secret",
  },
});
