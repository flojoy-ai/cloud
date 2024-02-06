import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
import {
  insertProjectSchema,
  publicUpdateProjectSchema,
} from "~/types/project";
import {
  hardwareAccessMiddleware,
  multiHardwareAccessMiddleware,
} from "./hardware";
import { workspaceAccessMiddleware } from "./workspace";
import { type ProjectId, project } from "~/schemas/public/Project";
import { createId } from "@paralleldrive/cuid2";
import { getProjectById } from "~/lib/project";
import { getHardwareById } from "~/lib/hardware";
import { generateDatabaseId } from "~/lib/id";

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
      openapi: { method: "POST", path: "/v1/projects/", tags: ["project"] },
    })
    .input(insertProjectSchema)
    .output(project)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      const model = await ctx.db
        .selectFrom("model")
        .selectAll("model")
        .where("model.id", "=", input.modelId)
        .executeTakeFirst();

      if (!model) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Model not found",
        });
      }

      return await ctx.db.transaction().execute(async (tx) => {
        const [project] = await tx
          .insertInto("project")
          .values({
            id: generateDatabaseId("project"),
            ...input,
          })
          .returningAll()
          .execute();

        if (!project) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        await tx
          .updateTable("workspace")
          .set({ updatedAt: new Date() })
          .where("id", "=", input.workspaceId)
          .execute();

        return project;
      });
    }),

  getProjectById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/projects/{projectId}",
        tags: ["project"],
      },
    })
    .input(z.object({ projectId: z.string() }))
    .use(projectAccessMiddleware)
    .output(project)
    .query(async ({ input }) => {
      const project = await getProjectById(input.projectId);

      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }

      return project;

      // TODO: Fix
      // const isDeviceModel =
      //   (await ctx.db.query.deviceModelTable.findFirst({
      //     where: (deviceModel, { eq }) => eq(deviceModel.id, project.modelId),
      //   })) !== undefined;
      //
      // if (isDeviceModel) {
      //   return {
      //     ...project,
      //     model: {
      //       ...project.model,
      //       type: "device",
      //     },
      //   };
      // }
      //
      // const deviceParts = await getSystemModelParts(project.modelId);
      //
      // if (!deviceParts) {
      //   throw new TRPCError({
      //     code: "INTERNAL_SERVER_ERROR",
      //     message: "An error occured when trying to fetch system model",
      //   });
      // }
      //
      // return {
      //   ...project,
      //   model: {
      //     ...project.model,
      //     type: "system",
      //     parts: deviceParts,
      //   },
      // };
    }),

  getAllProjectsByWorkspaceId: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/projects/", tags: ["project"] },
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
        tags: ["project", "hardware"],
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
        tags: ["project", "hardware"],
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
        tags: ["project", "hardware"],
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

        // const hardwares = await tx.query.hardwareTable.findMany({
        //   where: (hardware, { inArray }) =>
        //     inArray(hardware.id, input.hardwareIds),
        // });
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
        tags: ["project"],
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

  deleteProjectById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/projects/{projectId}",
        tags: ["project"],
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

      await ctx.db
        .deleteFrom("project")
        .where("project.id", "=", input.projectId)
        .execute();
    }),
});
