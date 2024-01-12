import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { project, project_device, workspace } from "~/server/db/schema";
import {
  publicInsertProjectSchema,
  publicUpdateProjectSchema,
  selectProjectSchema,
} from "~/types/project";
import { type db } from "~/server/db";
import { workspaceAccessMiddleware } from "./workspace";
import { checkWorkspaceAccess } from "~/lib/auth";
import { deviceAccessMiddleware } from "./devices";

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
    .output(selectProjectSchema)
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.project.findFirst({
        where: (project, { eq }) => eq(project.id, input.projectId),
      });
      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project not found",
        });
      }
      return result;
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

  addDeviceToProject: workspaceProcedure
    .meta({
      openapi: {
        method: "PUT",
        path: "/v1/projects/{projectId}/devices/{deviceId}",
        tags: ["project", "device"],
      },
    })
    .input(z.object({ projectId: z.string(), deviceId: z.string() }))
    .use(projectAccessMiddleware)
    .use(deviceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.insert(project_device).values({
        deviceId: input.deviceId,
        projectId: input.projectId,
      });
    }),

  removeDeviceFromProject: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/projects/{projectId}/devices/{deviceId}",
        tags: ["project", "device"],
      },
    })
    .input(z.object({ projectId: z.string(), deviceId: z.string() }))
    .use(projectAccessMiddleware)
    .use(deviceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(project_device)
        .where(
          and(
            eq(project_device.deviceId, input.deviceId),
            eq(project_device.projectId, input.projectId),
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
