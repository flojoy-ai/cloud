import { createWorkspace } from "@cloud/shared";
import { Elysia, error, t } from "elysia";
import { ok, safeTry } from "neverthrow";
import { DatabaseError } from "pg";
import { populateExample } from "../db/example";
import { db } from "../db/kysely";
import { fromTransaction, generateDatabaseId, tryQuery } from "../lib/db-utils";
import { InternalServerError } from "../lib/error";
import { AuthMiddleware } from "../middlewares/auth";

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
  .get("/", async ({ user, authMethod, request }) => {
    if (authMethod === "secret") {
      const personalSecret = request.headers.get(
        "flojoy-workspace-personal-secret",
      );

      return await db
        .selectFrom("workspace_user as wu")
        .where("wu.role", "!=", "pending")
        .where("wu.userId", "=", user.id)
        .innerJoin("workspace as w", "w.id", "wu.workspaceId")
        .innerJoin("user_session as us", (join) =>
          join
            .on("us.id", "=", personalSecret)
            .onRef("us.workspaceId", "=", "w.id"),
        )
        .selectAll("w")
        .execute();
    }
    return await db
      .selectFrom("workspace_user as wu")
      .where("wu.role", "!=", "pending")
      .innerJoin("workspace as w", "w.id", "wu.workspaceId")
      .where("wu.userId", "=", user.id)
      .selectAll("w")
      .execute();
  })
  .post(
    "/",
    async ({ body, user, error, cookie: { scope } }) => {
      const { populateData, ...data } = body;

      const res = await fromTransaction(async (tx) => {
        return safeTry(async function* () {
          const newWorkspace = yield* tryQuery(
            tx
              .insertInto("workspace")
              .values({
                id: generateDatabaseId("workspace"),
                ...data,
                planType: "enterprise",
              })
              .returningAll()
              .executeTakeFirstOrThrow(
                () => new InternalServerError("Failed to create workspace"),
              ),
          ).safeUnwrap();

          const workspaceUser = yield* tryQuery(
            tx
              .insertInto("workspace_user")
              .values({
                workspaceId: newWorkspace.id,
                userId: user.id,
                role: "owner" as const,
              })
              .returningAll()
              .executeTakeFirstOrThrow(
                () =>
                  new InternalServerError("Failed to create workspace user"),
              ),
          ).safeUnwrap();

          scope.value = newWorkspace.namespace;

          if ("_type" in newWorkspace) {
            return ok(newWorkspace);
          }

          if (populateData) {
            yield* (await populateExample(tx, workspaceUser)).safeUnwrap();
          }
          return ok(newWorkspace);
        });
      });

      if (res.isErr()) {
        return error(500, res.error);
      }

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
      .executeTakeFirst();

    if (!workspace) {
      return error(404, "workspace not found or you do not have access");
    }

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
