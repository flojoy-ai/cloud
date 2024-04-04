import { AuthMiddleware } from "../middlewares/auth";
import { createWorkspace } from "@cloud/shared";
import { Elysia, NotFoundError, error, t } from "elysia";
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
    switch (code) {
      case "DatabaseError":
        set.status = 500;
        return error;
      default:
        return error;
    }
  })
  .get("/", async ({ user, authMethod }) => {
    if (authMethod === "secret") {
      return error("I'm a teapot");
    }
    return await db
      .selectFrom("workspace_user as wu")
      .where("wu.role", "!=", "pending")
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

          await tx
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

          return newWorkspace;
        }),
        (e) => (e as Error).message,
      );

      if (res.isErr()) {
        return error(500, res.error);
      }

      if (!populateData) {
        return res.value;
      }

      await populateExample(db, res.value.id);

      return res.value;
    },
    {
      body: createWorkspace,
      cookie: t.Cookie({
        scope: t.String(),
      }),
    },
  )
  .get("/:namespace", async ({ params, authMethod, request, user }) => {
    const workspace = await db
      .selectFrom("workspace as w")
      .selectAll()
      .where("w.namespace", "=", params.namespace)
      .innerJoin("workspace_user as wu", (join) =>
        join.onRef("wu.workspaceId", "=", "w.id").on("wu.userId", "=", user.id),
      )
      .executeTakeFirstOrThrow(
        () =>
          new NotFoundError(
            "You do not have access to this workspace or it does not exist",
          ),
      );

    if (authMethod === "secret") {
      // NOTE: Why is this needed? Since the auth method is secret and a given
      // secret is scoped to a specific workspace, we need to make sure only
      // that specific workspace can be retrived
      const personalSecret = request.headers.get(
        "flojoy-workspace-personal-secret",
      );
      if (!personalSecret) {
        return error(500, "This is impossible");
      }

      const userSession = await db
        .selectFrom("user_session as us")
        .selectAll()
        .where("us.id", "=", personalSecret)
        .executeTakeFirst();

      if (userSession?.workspaceId !== workspace.id) {
        return error(403, "You do not have access to this workspace");
      }
    }

    return workspace;
  });
