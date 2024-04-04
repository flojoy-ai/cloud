import { AuthMiddleware } from "../middlewares/auth";
import { createWorkspace } from "@cloud/shared";
import { Elysia, NotFoundError, t } from "elysia";
import { db } from "../db/kysely";
import { DatabaseError } from "pg";
import { generateDatabaseId } from "../lib/db-utils";
import { populateExample } from "../db/example";
import { fromPromise } from "neverthrow";

export const WorkspaceRoute = new Elysia({
  prefix: "/workspace",
  name: "WorkspaceRoute",
})
  .use(AuthMiddleware)
  .error({
    DatabaseError,
  })
  .onError(({ code, error, set }) => {
    // TODO: handle this better
    switch (code) {
      case "DatabaseError":
        set.status = 500;
        return error;
      default:
        return error;
    }
  })
  .get("/", async ({ user }) => {
    return await db
      .selectFrom("workspace_user as wu")
      .innerJoin("workspace as w", "w.id", "wu.workspaceId")
      .innerJoin("user as u", "u.id", "wu.userId")
      .where("wu.userId", "=", user.id)
      .selectAll("w")
      .execute();
  })
  .post(
    "/",
    async ({ body, user, error, cookie: { scope } }) => {
      const { populateData, ...data } = body;

      const res = await fromPromise(
        db.transaction().execute(async (tx) => {
          const newWorkspace = await tx
            .insertInto("workspace")
            .values({
              id: generateDatabaseId("workspace"),
              ...data,
              planType: "enterprise",
            })
            .returningAll()
            .executeTakeFirstOrThrow(
              () => new Error("Failed to create workspace"),
            );

          const workspaceUser = await tx
            .insertInto("workspace_user")
            .values({
              workspaceId: newWorkspace.id,
              userId: user.id,
              role: "owner" as const,
            })
            .returningAll()
            .executeTakeFirstOrThrow(
              () => new Error("Failed to create workspace user"),
            );

          scope.value = newWorkspace.namespace;

          return { newWorkspace, workspaceUser };
        }),
        (e) => (e as Error).message,
      );

      if (res.isErr()) {
        return error(500, res.error);
      }
      const { newWorkspace, workspaceUser } = res.value;

      if ("_type" in newWorkspace) {
        return newWorkspace;
      }

      if (!populateData) {
        return newWorkspace;
      }

      await populateExample(db, workspaceUser);

      return newWorkspace;
    },
    {
      body: createWorkspace,
      cookie: t.Cookie({
        scope: t.String(),
      }),
    },
  )
  .get("/:namespace", async ({ params }) => {
    return await db
      .selectFrom("workspace")
      .selectAll()
      .where("workspace.namespace", "=", params.namespace)
      .executeTakeFirstOrThrow(
        () =>
          new NotFoundError(
            "You do not have access to this workspace or it does not exist",
          ),
      );
  });
