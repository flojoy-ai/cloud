import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
import {
  insertProjectSchema,
  publicUpdateProjectSchema,
  selectProjectSchema,
} from "~/types/project";
import {
  hardwareAccessMiddleware,
  multiHardwareAccessMiddleware,
} from "./hardware";
import { workspaceAccessMiddleware } from "./workspace";
import { type DatabaseError } from "pg";
import { type ProjectId, project } from "~/schemas/public/Project";
import { generateDatabaseId } from "~/lib/id";
import { markUpdatedAt, getProjectById, getHardwareById } from "~/lib/query";
import { withDBErrorCheck } from "~/lib/db-utils";

export const projectAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { projectId: ProjectId };
}>().create(async (opts) => {
  const project = await getProjectById(opts.input.projectId);

  if (!project) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Project not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    project.workspaceId,
  );

  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this project",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      project,
      workspaceUser,
    },
  });
});

export const projectRouter = createTRPCRouter({
  createProject: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/projects/", tags: ["projects"] },
    })
    .input(insertProjectSchema)
    .output(project)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .selectFrom("model")
        .selectAll("model")
        .where("model.id", "=", input.modelId)
        .executeTakeFirstOrThrow(
          () =>
            new TRPCError({
              code: "NOT_FOUND",
              message: "Model not found",
            }),
        );

      return await ctx.db.transaction().execute(async (tx) => {
        const project = await withDBErrorCheck(
          tx
            .insertInto("project")
            .values({
              id: generateDatabaseId("project"),
              ...input,
            })
            .returningAll()
            .executeTakeFirstOrThrow(
              () =>
                new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to create project",
                }),
            ),
          {
            errorCode: "DUPLICATE",
            errorMsg: `A project with name "${input.name}" for workspace "${ctx.workspace.namespace}" already exists!`,
          },
        );

        await markUpdatedAt(tx, "workspace", input.workspaceId);
        return project;
      });
    }),

  getProject: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/projects/{projectId}",
        tags: ["projects"],
      },
    })
    .input(z.object({ projectId: z.string() }))
    .use(projectAccessMiddleware)
    .output(selectProjectSchema)
    .query(async ({ ctx }) => {
      return ctx.project;
    }),

  getAllProjects: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/projects/", tags: ["projects"] },
    })
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.array(project))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .selectFrom("project")
        .selectAll("project")
        .where("workspaceId", "=", input.workspaceId)
        .execute();
    }),

  addHardwareToProject: workspaceProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/v1/projects/{projectId}/hardware/{hardwareId}",
        tags: ["projects", "hardware"],
      },
    })
    .input(
      z.object({
        projectId: z.string(),
        hardwareId: z.string(),
      }),
    )
    .use(projectAccessMiddleware)
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const project = await getProjectById(input.projectId);

      if (project === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const hardware = await getHardwareById(input.hardwareId);

      if (hardware === undefined) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Hardware not found",
        });
      }

      if (hardware.modelId !== project.modelId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hardware model does not match project model",
        });
      }

      await ctx.db
        .insertInto("project_hardware")
        .values({
          hardwareId: input.hardwareId,
          projectId: input.projectId,
        })
        .execute();
    }),

  removeHardwareFromProject: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/projects/{projectId}/hardware/{hardwareId}",
        tags: ["projects", "hardware"],
      },
    })
    .input(
      z.object({
        projectId: z.string(),
        hardwareId: z.string(),
      }),
    )
    .use(projectAccessMiddleware)
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .deleteFrom("project_hardware")
        .where("projectId", "=", input.projectId)
        .where("hardwareId", "=", input.hardwareId)
        .execute();
    }),

  setProjectHardware: workspaceProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/v1/projects/{projectId}/hardware",
        tags: ["projects", "hardware"],
      },
    })
    .input(
      z.object({
        projectId: z.string(),
        hardwareIds: z.string().array(),
      }),
    )
    .use(multiHardwareAccessMiddleware)
    .use(projectAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.transaction().execute(async (tx) => {
        await tx
          .deleteFrom("project_hardware")
          .where("projectId", "=", input.projectId)
          .execute();

        if (input.hardwareIds.length === 0) {
          return;
        }

        const hardwares = await tx
          .selectFrom("hardware")
          .selectAll("hardware")
          .where("id", "in", input.hardwareIds)
          .execute();

        const project = await getProjectById(input.projectId);

        if (project === undefined) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Project not found",
          });
        }

        if (hardwares.length !== input.hardwareIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not all hardware IDs valid",
          });
        }

        if (hardwares.some((h) => h.modelId !== project.modelId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not all hardware IDs match project model",
          });
        }

        await tx
          .insertInto("project_hardware")
          .values(
            input.hardwareIds.map((hardwareId) => ({
              hardwareId,
              projectId: input.projectId,
            })),
          )
          .execute();
      });
    }),

  updateProject: workspaceProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/v1/projects/{projectId}",
        tags: ["projects"],
      },
    })
    .input(publicUpdateProjectSchema)
    .use(projectAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const { projectId, ...updatedProject } = input;

      await ctx.db
        .updateTable("project")
        .set(updatedProject)
        .where("project.id", "=", input.projectId)
        .execute();
    }),

  deleteProject: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/projects/{projectId}",
        tags: ["projects"],
      },
    })
    .input(z.object({ projectId: z.string() }))
    .use(projectAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      await withDBErrorCheck(
        ctx.db
          .deleteFrom("project")
          .where("project.id", "=", input.projectId)
          .execute(),
        {
          errorCode: "FOREIGN_KEY_VIOLATION",
          errorMsg:
            "Cannot delete project because some of its resources are in use, make sure all associated items are deleted first",
        },
      );
    }),
});
