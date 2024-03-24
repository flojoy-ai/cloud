import { db } from "@/db/kysely";
import { createProject } from "@/db/project";
import { AuthMiddleware } from "@/middlewares/auth";
import { ProjectMiddleware } from "@/middlewares/project";
import { WorkspaceMiddleware } from "@/middlewares/workspace";
import { CreateProjectSchema } from "@/types/project";
import { Elysia, error } from "elysia";
import { DatabaseError } from "pg";

export const ProjectRoute = new Elysia({
  prefix: "/project",
  name: "ProjectRoute",
})
  .use(AuthMiddleware)
  .use(WorkspaceMiddleware)
  .error({
    DatabaseError,
  })
  .onError(({ code, error, set }) => {
    // TODO: handle this better
    switch (code) {
      case "DatabaseError":
        set.status = 409;
        return error;
      default:
        return error;
    }
  })
  .get("/", async ({ workspace }) => {
    return await db
      .selectFrom("project")
      .selectAll("project")
      .where("workspaceId", "=", workspace.id)
      .execute();
  })
  .post(
    "/",
    async ({ body, workspace }) => {
      const model = await db
        .selectFrom("model as m")
        .where("m.id", "=", body.modelId)
        .selectAll()
        .executeTakeFirstOrThrow();

      const project = await createProject(db, {
        ...body,
        modelId: model.id,
        workspaceId: workspace.id,
      });

      if (project.isErr()) {
        return error(500, project.error);
      }
      return project.value;
    },
    {
      body: CreateProjectSchema,
    },
  )
  .group("/:projectId", (project) =>
    project.use(ProjectMiddleware).get("/", async ({ params, project }) => {
      console.log(params.projectId);
      console.log(project);
    }),
  );
