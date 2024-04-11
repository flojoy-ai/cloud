import { fromPromise } from "neverthrow";
import { db } from "../db/kysely";
import { createProject, getProject } from "../db/project";
import { checkProjectPerm } from "../lib/perm/project";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { CreateProjectSchema } from "@cloud/shared";
import { Elysia, error } from "elysia";
import { DatabaseError } from "pg";
import { checkWorkspacePerm } from "../lib/perm/workspace";

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
  .get(
    "/:projectId",
    async ({ params: { projectId } }) => {
      const project = await getProject(db, projectId);

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
  );
