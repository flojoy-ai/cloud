import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { getSystemModelParts } from "~/lib/query";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
import {
  projectTable,
  projectHardwareTable,
  workspaceTable,
} from "~/server/db/schema";
import { selectModelSchema } from "~/types/model";
import {
  publicInsertProjectSchema,
  publicUpdateProjectSchema,
  selectProjectSchema,
} from "~/types/project";
import {
  hardwareAccessMiddleware,
  multiHardwareAccessMiddleware,
} from "./hardware";
import { workspaceAccessMiddleware } from "./workspace";

export const projectAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { projectId: string };
}>().create(async (opts) => {
  const project = await opts.ctx.db.query.projectTable.findFirst({
    where: (project, { eq }) => eq(project.id, opts.input.projectId),
    with: { workspace: true },
  });

  if (!project) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Project not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    project.workspace.id,
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
      workspaceId: workspaceUser.workspaceId,
      projectId: project.id,
    },
  });
});

export const projectRouter = createTRPCRouter({
  createProject: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/projects/", tags: ["project"] },
    })
    .input(publicInsertProjectSchema)
    .output(selectProjectSchema)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      const model = await ctx.db.query.modelTable.findFirst({
        where: (model, { eq }) => eq(model.id, input.modelId),
      });

      if (model === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Model not found",
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const [projectCreateResult] = await tx
          .insert(projectTable)
          .values(input)
          .returning();

        if (!projectCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        await tx
          .update(workspaceTable)
          .set({ updatedAt: new Date() })
          .where(eq(workspaceTable.id, input.workspaceId));
        return projectCreateResult;
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
    .output(
      selectProjectSchema.extend({
        model: selectModelSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      const project = await ctx.db.query.projectTable.findFirst({
        where: (project, { eq }) => eq(project.id, input.projectId),
        with: { model: true },
      });
      if (!project) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }

      // TODO: Is there a clean way to just attach this to the above query somehow?
      const isDeviceModel =
        (await ctx.db.query.deviceModelTable.findFirst({
          where: (deviceModel, { eq }) => eq(deviceModel.id, project.modelId),
        })) !== undefined;

      if (isDeviceModel) {
        return {
          ...project,
          model: {
            ...project.model,
            type: "device",
          },
        };
      }

      const deviceParts = await getSystemModelParts(project.modelId);

      if (!deviceParts) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occured when trying to fetch system model",
        });
      }

      return {
        ...project,
        model: {
          ...project.model,
          type: "system",
          parts: deviceParts,
        },
      };
    }),

  getAllProjectsByWorkspaceId: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/projects/", tags: ["project"] },
    })
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.array(selectProjectSchema))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.projectTable.findMany({
        where: (project, { eq }) => eq(project.workspaceId, input.workspaceId),
      });
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
      const project = await ctx.db.query.projectTable.findFirst({
        where: (project, { eq }) => eq(project.id, input.projectId),
      });

      if (project === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }

      const hardware = await ctx.db.query.hardwareTable.findFirst({
        where: (hardware, { eq }) => eq(hardware.id, input.hardwareId),
      });

      if (hardware === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hardware not found",
        });
      }

      if (hardware.modelId !== project.modelId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hardware model does not match project model",
        });
      }

      await ctx.db.insert(projectHardwareTable).values({
        hardwareId: input.hardwareId,
        projectId: input.projectId,
      });
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
        .delete(projectHardwareTable)
        .where(
          and(
            eq(projectHardwareTable.hardwareId, input.hardwareId),
            eq(projectHardwareTable.projectId, input.projectId),
          ),
        );
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
      await ctx.db.transaction(async (tx) => {
        await tx
          .delete(projectHardwareTable)
          .where(eq(projectHardwareTable.projectId, input.projectId));

        if (input.hardwareIds.length === 0) {
          return;
        }

        const hardwares = await tx.query.hardwareTable.findMany({
          where: (hardware, { inArray }) =>
            inArray(hardware.id, input.hardwareIds),
        });

        const project = await tx.query.projectTable.findFirst({
          where: (project, { eq }) => eq(project.id, input.projectId),
        });

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

        await tx.insert(projectHardwareTable).values(
          input.hardwareIds.map((hardwareId) => ({
            hardwareId,
            projectId: input.projectId,
          })),
        );
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { projectId, ...updatedProject } = input;
      await ctx.db
        .update(projectTable)
        .set(updatedProject)
        .where(eq(projectTable.id, input.projectId));
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
      await ctx.db
        .delete(projectTable)
        .where(eq(projectTable.id, input.projectId));
    }),
});
