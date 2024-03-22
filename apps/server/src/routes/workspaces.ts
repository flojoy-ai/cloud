import { AuthMiddleware } from "@/middlewares/auth";
import { createWorkspace } from "@/types/workspace";
import { Elysia, NotFoundError, t } from "elysia";
import { db } from "@/db/kysely";
import { DatabaseError } from "pg";
import { generateDatabaseId } from "@/lib/db-utils";
import { withDBErrorCheck } from "@/lib/db-utils";

export const workspacesRoute = new Elysia({ prefix: "/workspaces" })
  .use(AuthMiddleware)
  .error({
    DatabaseError,
  })
  .onError(({ code, error, set }) => {
    switch (code) {
      case "DatabaseError":
        set.status = 409;
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

      const newWorkspace = await db.transaction().execute(async (tx) => {
        const newWorkspace = await withDBErrorCheck(
          tx
            .insertInto("workspace")
            .values({
              id: generateDatabaseId("workspace"),
              ...data,
              planType: "enterprise",
            })
            .returningAll()
            .executeTakeFirst(),
          {
            errorCode: "DUPLICATE",
            errorMsg: `Workspace with namespace "${data.namespace}" already exists`,
          },
        );

        if (!newWorkspace) {
          return error(500, "Failed to create workspace");
        }

        await tx
          .insertInto("workspace_user")
          .values({
            workspaceId: newWorkspace.id,
            userId: user.id,
            role: "owner" as const,
          })
          .execute();

        scope.value = newWorkspace.namespace;

        return newWorkspace;
      });

      if (!populateData) {
        return newWorkspace;
      }

      throw new Error("Populate example not implemented yet");

      // await populateExample(ctx.db, newWorkspace.id);

      // return newWorkspace;
    },
    {
      body: createWorkspace,
      cookie: t.Cookie({
        scope: t.String(),
      }),
    },
  )
  .get("/:id", getWorkspace)
  .get(
    "/id/:namespace",
    async ({ params }) => {
      const res = await db
        .selectFrom("workspace")
        .select("id")
        .where("workspace.namespace", "=", params.namespace)
        .executeTakeFirstOrThrow(
          () =>
            new NotFoundError(
              `Workspace with namespace '${params.namespace}' not found`,
            ),
        );

      return res.id;
    },
    {
      params: t.Object({ namespace: t.String() }),
    },
  );

function getWorkspace(req: Request, res: Response) {
  // ...
}
