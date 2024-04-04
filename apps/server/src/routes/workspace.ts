import { createWorkspace } from "@cloud/shared";
import { Elysia, NotFoundError, t } from "elysia";
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
