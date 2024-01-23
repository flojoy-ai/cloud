import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { getSystemModelParts } from "~/lib/query";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
import { project, project_hardware, workspace } from "~/server/db/schema";
import { selectModelSchema } from "~/types/model";
import {
  publicInsertProjectSchema,
  publicUpdateProjectSchema,
  selectProjectSchema,
} from "~/types/project";
import { hardwareAccessMiddleware } from "./hardware";
import { workspaceAccessMiddleware } from "./workspace";

export const projectAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { projectId: string };
}>().create(async (opts) => {
  const project = await opts.ctx.db.query.project.findFirst({
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
      return await ctx.db.transaction(async (tx) => {
        const [projectCreateResult] = await tx
          .insert(project)
          .values(input)
          .returning();

        if (!projectCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        await tx
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, input.workspaceId));
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
      const project = await ctx.db.query.project.findFirst({
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
        (await ctx.db.query.deviceModel.findFirst({
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
      return await ctx.db.query.project.findMany({
        where: (project, { eq }) => eq(project.workspaceId, input.workspaceId),
      });
    }),

  // TODO: Extra system logic
  addHardwareToProject: workspaceProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/v1/projects/{projectId}/hardware/{hardwareId}",
        tags: ["project", "hardware"],
      },
    })
    .input(z.object({ projectId: z.string(), hardwareId: z.string() }))
    .use(projectAccessMiddleware)
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.insert(project_hardware).values({
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
    .input(z.object({ projectId: z.string(), hardwareId: z.string() }))
    .use(projectAccessMiddleware)
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(project_hardware)
        .where(
          and(
            eq(project_hardware.hardwareId, input.hardwareId),
            eq(project_hardware.projectId, input.projectId),
          ),
        );
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
        .update(project)
        .set(updatedProject)
        .where(eq(project.id, input.projectId));
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
      await ctx.db.delete(project).where(eq(project.id, input.projectId));
    }),
});
