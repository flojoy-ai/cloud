import {
  createWorkspace,
  updateWorkspace,
  workspaceUserInvite,
} from "@cloud/shared";
import { Elysia, error, t } from "elysia";
import { ok, safeTry } from "neverthrow";
import { DatabaseError } from "pg";
import { populateExample } from "../db/example";
import { db } from "../db/kysely";
import { fromTransaction, generateDatabaseId, tryQuery } from "../lib/db-utils";
import { InternalServerError } from "../lib/error";
import { AuthMiddleware } from "../middlewares/auth";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { User } from "@cloud/shared/src/schemas/public/User";
import { Workspace } from "@cloud/shared/src/schemas/public/Workspace";

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
  })
  .get("/invite", async ({ authMethod, user }) => {
    if (authMethod === "secret") {
      return error("I'm a teapot");
    }

    return await db
      .selectFrom("user_invite as uv")
      .where("uv.email", "=", user.email)
      .select((eb) => [
        jsonObjectFrom(
          eb
            .selectFrom("workspace as w")
            .whereRef("w.id", "=", "uv.workspaceId")
            .selectAll("w"),
        ).as("workspace"),
      ])
      .selectAll()
      .$narrowType<{ workspace: Workspace }>()
      .execute();
  })
  .patch(
    "/invite",
    async ({ authMethod, user, body: { accept, workspaceId } }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      await db.transaction().execute(async (tx) => {
        const invite = await tx
          .deleteFrom("user_invite as uv")
          .where("uv.workspaceId", "=", workspaceId)
          .where("uv.email", "=", user.email)
          .returningAll()
          .executeTakeFirstOrThrow(
            () => new InternalServerError("Failed to find invite"),
          );

        if (!accept) {
          return;
        }

        await tx
          .insertInto("workspace_user")
          .values({
            workspaceId,
            userId: user.id,
            role: invite.role,
          })
          .execute();
      });
    },
    {
      body: t.Object({
        workspaceId: t.String(),
        accept: t.Boolean(),
      }),
    },
  )
  .use(WorkspaceMiddleware)
  .get(
    "/user",
    async ({ workspaceUser, authMethod }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      const workspaceUsers = await db
        .selectFrom("workspace_user as wu")
        .selectAll("wu")
        .where("wu.workspaceId", "=", workspaceUser.workspaceId)
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("user as u")
              .selectAll("u")
              .whereRef("u.id", "=", "wu.userId"),
          ).as("user"),
        ])
        .$narrowType<{ user: User }>()
        .execute();

      return workspaceUsers;
    },
    {
      async beforeHandle({ workspaceUser }) {
        const perm = await checkWorkspacePerm({
          workspaceUser,
        });

        return perm.match(
          (perm) => (perm.canRead() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
  .delete(
    "/user",
    async ({ workspaceUser, authMethod, body: { userId } }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      const targetUser = await db
        .selectFrom("workspace_user as wu")
        .selectAll("wu")
        .where("wu.userId", "=", userId)
        .where("wu.workspaceId", "=", workspaceUser.workspaceId)
        .executeTakeFirstOrThrow(
          () => new InternalServerError("Failed to find user"),
        );

      if (targetUser.role === "owner") {
        return error(403, "Cannot remove owner");
      }

      if (targetUser.userId === workspaceUser.userId) {
        return error(403, "Cannot remove self");
      }

      if (workspaceUser.role === "admin" && targetUser.role === "admin") {
        return error(403, "Cannot remove another admin");
      }

      const workspaceUsers = await db
        .deleteFrom("workspace_user as wu")
        .where("wu.workspaceId", "=", targetUser.workspaceId)
        .where("wu.userId", "=", targetUser.userId)
        .execute();

      return workspaceUsers;
    },
    {
      body: t.Object({ userId: t.String() }),
      async beforeHandle({ workspaceUser }) {
        const perm = await checkWorkspacePerm({
          workspaceUser,
        });

        return perm.match(
          (perm) => (perm.canAdmin() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
  .patch(
    "/",
    async ({ workspaceUser, body, authMethod }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      const workspace = await db
        .updateTable("workspace")
        .set({
          ...body,
        })
        .where("workspace.id", "=", workspaceUser.workspaceId)
        .returningAll()
        .executeTakeFirstOrThrow(
          () => new InternalServerError("Failed to create workspace"),
        );

      return workspace;
    },
    {
      body: updateWorkspace,
      async beforeHandle({ workspaceUser }) {
        const perm = await checkWorkspacePerm({
          workspaceUser,
        });

        return perm.match(
          (perm) => (perm.canAdmin() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
  .delete(
    "/",
    async ({ workspaceUser, authMethod }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      return await db.transaction().execute(async (tx) => {
        await tx
          .deleteFrom("part_variation_relation as pvr")
          .where("pvr.workspaceId", "=", workspaceUser.workspaceId)
          .execute();
        await tx
          .deleteFrom("unit_relation as ur")
          .where("ur.workspaceId", "=", workspaceUser.workspaceId)
          .execute();

        const workspace = await tx
          .deleteFrom("workspace")
          .where("workspace.id", "=", workspaceUser.workspaceId)
          .returningAll()
          .executeTakeFirstOrThrow(
            () => new InternalServerError("Failed to create workspace"),
          );

        return workspace;
      });
    },
    {
      async beforeHandle({ workspaceUser }) {
        const perm = await checkWorkspacePerm({
          workspaceUser,
        });

        return perm.match(
          (perm) => (perm.isOwner() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
  .post(
    "/invite",
    async ({ workspaceUser, authMethod, body: { email, role } }) => {
      if (authMethod === "secret") {
        return error("I'm a teapot");
      }

      await db
        .deleteFrom("user_invite")
        .where("email", "=", email)
        .where("workspaceId", "=", workspaceUser.workspaceId)
        .execute();

      const invite = await db
        .insertInto("user_invite")
        .values({
          id: generateDatabaseId("user_invite"),
          workspaceId: workspaceUser.workspaceId,
          email,
          role,
        })
        .returningAll()
        .executeTakeFirstOrThrow(
          () => new InternalServerError("Failed to create invite"),
        );

      // TODO: send email

      return invite;
    },
    {
      body: workspaceUserInvite,
      async beforeHandle({ workspaceUser }) {
        const perm = await checkWorkspacePerm({
          workspaceUser,
        });

        return perm.match(
          (perm) => (perm.canAdmin() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  );
