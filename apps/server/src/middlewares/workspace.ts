import { Elysia, error, t } from "elysia";
import { AuthMiddleware } from "./auth";
import { db } from "../db/kysely";
import { logger } from "@bogeychan/elysia-logger";

export const WorkspaceMiddleware = new Elysia({ name: "WorkspaceMiddleware" })
  .guard({
    headers: t.Object({
      // NOTE: wasted half an hour here, http headers are case insensitive and
      // they are lowercased by default
      "flojoy-workspace-id": t.String(),
    }),
  })
  .use(
    logger({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    }),
  )
  .use(AuthMiddleware)
  .derive(async ({ headers: { "flojoy-workspace-id": workspaceId }, user }) => {
    const workspace = await db
      .selectFrom("workspace as w")
      .selectAll()
      .where("w.id", "=", workspaceId)
      .executeTakeFirst();

    if (!workspace) {
      return error(400, "Invalid workspace ID or you don't have access to it");
    }

    const workspaceUser = await db
      .selectFrom("workspace_user as wu")
      .selectAll()
      .where("wu.workspaceId", "=", workspace.id)
      .where("wu.userId", "=", user.id)
      .executeTakeFirst();

    if (!workspaceUser) {
      return error(400, "Invalid workspace ID or you don't have access to it");
    }

    return { workspace, workspaceUser };
  })
  .propagate();
