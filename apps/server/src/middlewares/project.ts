import { Elysia, error, t } from "elysia";
import { AuthMiddleware } from "./auth";
import { db } from "@/db/kysely";

export const ProjectMiddleware = new Elysia({ name: "ProjectMiddleware" })
  .guard({
    params: t.Object({
      projectId: t.String(),
    }),
  })
  .use(AuthMiddleware)
  .derive(async ({ params: { projectId }, user }) => {
    const project = await db
      .selectFrom("project as p")
      .selectAll()
      .where("p.id", "=", projectId)
      .executeTakeFirst();

    if (!project) {
      return error("Bad Request");
    }

    const workspaceUser = await db
      .selectFrom("workspace_user as wu")
      .selectAll()
      .where("wu.workspaceId", "=", project.workspaceId)
      .where("wu.userId", "=", user.id)
      .executeTakeFirst();

    if (!workspaceUser) {
      return error("Bad Request");
    }

    return { project, workspaceUser };
  })
  .propagate();
