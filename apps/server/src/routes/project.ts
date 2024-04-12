import { fromPromise } from "neverthrow";
import { db } from "../db/kysely";
import { createProject } from "../db/project";
import { checkProjectPerm } from "../lib/perm/project";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import {
  CreateProjectSchema,
  Perm,
  UpdateProjectSchema,
  projectRoleToPerm,
} from "@cloud/shared";
import { Elysia, InternalServerError, error, t } from "elysia";
import { DatabaseError } from "pg";
import { checkWorkspacePerm } from "../lib/perm/workspace";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import { User } from "@cloud/shared/src/schemas/public/User";

export const ProjectRoute = new Elysia({
  prefix: "/project",
  name: "ProjectRoute",
})
  .use(WorkspaceMiddleware)
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
  .get("/", async ({ workspaceUser }) => {
    return await db
      .selectFrom("project_user as pu")
      .where("pu.userId", "=", workspaceUser.userId)
      .where("pu.workspaceId", "=", workspaceUser.workspaceId)
      .innerJoin("project as p", "p.id", "pu.projectId")
      .selectAll("p")
      .execute();
  })
  .post(
    "/",
    async ({ body, workspaceUser }) => {
      if (body.workspaceId !== workspaceUser.workspaceId) {
        return error(400, "There is a mismatch in workspaceId");
      }

      const partVariation = await db
        .selectFrom("part_variation as p")
        .where("p.id", "=", body.partVariationId)
        .where("p.workspaceId", "=", workspaceUser.workspaceId)
        .selectAll()
        .executeTakeFirstOrThrow();

      const result = await fromPromise(
        db.transaction().execute(async (tx) => {
          const project = await createProject(tx, {
            ...body,
            partVariationId: partVariation.id,
            workspaceId: workspaceUser.workspaceId,
          });

          if (project.isErr()) {
            throw new Error(project.error);
          }

          await tx
            .insertInto("project_user")
            .values({
              projectId: project.value.id,
              userId: workspaceUser.userId,
              role: "dev",
              workspaceId: workspaceUser.workspaceId,
            })
            .executeTakeFirstOrThrow(
              () => new Error("Failed to create project user"),
            );

          return project.value;
        }),
        (e) => (e as Error).message,
      );

      if (result.isErr()) {
        return error(500, result.error);
      }

      return result.value;
    },
    {
      body: CreateProjectSchema,

      async beforeHandle({ workspaceUser, error }) {
        const perm = await checkWorkspacePerm({ workspaceUser });

        return perm.match(
          (perm) => (perm.canWrite() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  )
  .group("/:projectId", (app) =>
    app
      .get(
        "/",
        async ({ params }) => {
          const project = await db
            .selectFrom("project as p")
            .selectAll()
            .where("p.id", "=", params.projectId)
            .executeTakeFirst();

          if (!project) {
            return error(404, "project not found or you do not have access");
          }

          return project;
        },
        {
          async beforeHandle({ params, workspaceUser }) {
            const perm = await checkProjectPerm({
              projectId: params.projectId,
              workspaceUser,
            });

            return perm.match(
              (perm) => (perm.canRead() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
          },
        },
      )
      .patch(
        "/",
        async ({ body, authMethod, params: { projectId } }) => {
          if (authMethod === "secret") {
            return error("I'm a teapot");
          }

          const project = await db
            .updateTable("project")
            .set({
              ...body,
            })
            .where("project.id", "=", projectId)
            .returningAll()
            .executeTakeFirstOrThrow(
              () => new InternalServerError("Failed to update production line"),
            );

          return project;
        },
        {
          body: UpdateProjectSchema,
          async beforeHandle({ workspaceUser, params }) {
            const perm = await checkProjectPerm({
              projectId: params.projectId,
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
        async ({  authMethod, params: { projectId } }) => {
          if (authMethod === "secret") {
            return error("I'm a teapot");
          }

          const project = await db
            .deleteFrom("project")
            .where("project.id", "=", projectId)
            .returningAll()
            .executeTakeFirstOrThrow(
              () => new InternalServerError("Failed to update production line"),
            );

          return project;
        },
        {
          async beforeHandle({ workspaceUser, params }) {
            const perm = await checkProjectPerm({
              projectId: params.projectId,
              workspaceUser,
            });

            return perm.match(
              (perm) => (perm.canAdmin() ? undefined : error("Forbidden")),
              (err) => error(403, err),
            );
          },
        },
      )

      .group("/user", (app) =>
        app
          .get(
            "/",
            async ({ workspaceUser, authMethod, params: { projectId } }) => {
              if (authMethod === "secret") {
                return error("I'm a teapot");
              }

              const projectUsers = await db
                .selectFrom("project_user as pu")
                .selectAll("pu")
                .where("pu.workspaceId", "=", workspaceUser.workspaceId)
                .where("pu.projectId", "=", projectId)
                .select((eb) => [
                  jsonObjectFrom(
                    eb
                      .selectFrom("user as u")
                      .selectAll("u")
                      .whereRef("u.id", "=", "pu.userId"),
                  ).as("user"),
                ])
                .$narrowType<{ user: User }>()
                .execute();

              return projectUsers;
            },
            {
              async beforeHandle({ workspaceUser, params: { projectId } }) {
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
          )
          .delete(
            "/",
            async ({
              workspaceUser,
              authMethod,
              body: { userId },
              params: { projectId },
            }) => {
              if (authMethod === "secret") {
                return error("I'm a teapot");
              }

              const targetUser = await db
                .selectFrom("project_user as pu")
                .selectAll("pu")
                .where("pu.userId", "=", userId)
                .where("pu.workspaceId", "=", workspaceUser.workspaceId)
                .where("pu.projectId", "=", projectId)
                .executeTakeFirstOrThrow(
                  () => new InternalServerError("Failed to find user"),
                );

              const perm = new Perm(projectRoleToPerm(targetUser.role));
              if (
                targetUser.userId !== workspaceUser.userId &&
                perm.canAdmin()
              ) {
                // we allow self delete here in this case, which makes sense
                return error(400, "Cannot delete an admin");
              }

              const projectUser = await db
                .deleteFrom("project_user as pu")
                .where("pu.workspaceId", "=", targetUser.workspaceId)
                .where("pu.userId", "=", targetUser.userId)
                .where("pu.projectId", "=", targetUser.projectId)
                .executeTakeFirst();

              return projectUser;
            },
            {
              body: t.Object({ userId: t.String() }),
              async beforeHandle({ workspaceUser, params: { projectId } }) {
                const perm = await checkProjectPerm({
                  projectId,
                  workspaceUser,
                });

                return perm.match(
                  (perm) => (perm.canAdmin() ? undefined : error("Forbidden")),
                  (err) => error(403, err),
                );
              },
            },
          ),
      ),
  );
