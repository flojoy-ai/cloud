import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { project, workspace } from "~/server/db/schema";
import {
  publicInsertProjectSchema,
  selectProjectSchema,
} from "~/types/project";
import { type db } from "~/server/db";
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

  // There are 2 cases:
  // Case 1: Authentication with secret key, in this case workspaceId will be
  // defined in the ctx, thus just need to check if the resource belongs to that
  // workspace, then we will be done.
  if (opts.ctx.workspaceId && project.workspace.id !== opts.ctx.workspaceId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this project",
    });
  }

  // Case 2: Authentication with session, in this case we need to check if the
  // has access to the workspace that this resource belongs to
  if (!opts.ctx.workspaceId) {
    const perm = await opts.ctx.db.query.workspace_user.findFirst({
      where: (workspace_user, { and, eq }) =>
        and(
          eq(workspace_user.workspaceId, project.workspace.id),
          eq(workspace_user.userId, opts.ctx.userId),
        ),
    });
    if (!perm) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have access to this project",
      });
    }
  }

  return opts.next();
});

export const projectRouter = createTRPCRouter({
  createProject: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/projects/" },
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
    .meta({ openapi: { method: "GET", path: "/v1/projects/{projectId}" } })
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
    .meta({ openapi: { method: "GET", path: "/v1/projects/" } })
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.array(selectProjectSchema))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.project.findMany({
        where: (project, { eq }) => eq(project.workspaceId, input.workspaceId),
      });
    }),
});
