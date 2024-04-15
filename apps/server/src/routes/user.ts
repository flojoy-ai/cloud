import { AuthMiddleware } from "../middlewares/auth";
import { Elysia, InternalServerError } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkProjectPerm } from "../lib/perm/project";
import { db } from "../db/kysely";

export const UserRoute = new Elysia({ prefix: "/user", name: "UserRoute" })
  .use(AuthMiddleware)
  .get("/", async ({ user }) => {
    return user;
  })
  .use(WorkspaceMiddleware)
  .get("/workspace", async ({ workspaceUser }) => {
    return workspaceUser;
  })
  .get(
    "/project/:projectId",
    async ({ params: { projectId }, workspaceUser }) => {
      return await db
        .selectFrom("project_user as pu")
        .selectAll("pu")
        .where("pu.projectId", "=", projectId)
        .where("pu.workspaceId", "=", workspaceUser.workspaceId)
        .where("pu.userId", "=", workspaceUser.userId)
        .executeTakeFirstOrThrow(
          () => new InternalServerError("Failed to find project user"),
        );
    },

    {
      async beforeHandle({ params: { projectId }, workspaceUser, error }) {
        const perm = await checkProjectPerm({
          projectId,
          workspaceUser,
        });

        return perm.match(
          (perm) => (perm.canRead() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  );
