import { Elysia, error, t } from "elysia";
import { AuthMiddleware } from "./auth";
import { db } from "@/db/kysely";

export const WorkspaceMiddleware = new Elysia({ name: "WorkspaceMiddleware" })
  .guard({
    headers: t.Object({
      "Flojoy-Workspace-Id": t.String(),
    }),
  })
  .use(AuthMiddleware)
  .derive(async ({ headers: { "Flojoy-Workspace-Id": workspaceId }, user }) => {
    const workspace = await db
      .selectFrom("workspace as w")
      .selectAll()
      .where("w.id", "=", workspaceId)
      .executeTakeFirst();

    if (!workspace) {
      return error("Bad Request");
    }

    const workspaceUser = await db
      .selectFrom("workspace_user as wu")
      .selectAll()
      .where("wu.workspaceId", "=", workspace.id)
      .where("wu.userId", "=", user.id)
      .executeTakeFirst();

    if (!workspaceUser) {
      return error("Bad Request");
    }

    return { workspace, workspaceUser };
  })
  .propagate();
