import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspace, workspace_user } from "~/server/db/schema";
import {
  publicInsertWorkspaceSchema,
  selectWorkspaceSchema,
} from "~/types/workspace";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";

export const workspaceAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { workspaceId: string };
}>().create(async (opts) => {
  const workspace = await opts.ctx.db.query.workspace.findFirst({
    where: (workspace, { eq }) => eq(workspace.id, opts.input.workspaceId),
  });

  if (!workspace) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Workspace not found",
    });
  }

  // There are 2 cases:
  // Case 1: Authentication with secret key, in this case workspaceId will be
  // defined in the ctx, thus just need to check if the resource belongs to that
  // workspace, then we will be done.
  if (opts.ctx.workspaceId && workspace.id !== opts.ctx.workspaceId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this workspace",
    });
  }

  // Case 2: Authentication with session, in this case we need to check if the
  // has access to the workspace that this resource belongs to
  if (!opts.ctx.workspaceId) {
    const perm = await opts.ctx.db.query.workspace_user.findFirst({
      where: (workspace_user, { and, eq }) =>
        and(
          eq(workspace_user.workspaceId, workspace.id),
          eq(workspace_user.userId, opts.ctx.userId),
        ),
    });
    if (!perm) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have access to this workspace",
      });
    }
  }

  return opts.next();
});

export const workspaceRouter = createTRPCRouter({
  createWorkspace: protectedProcedure
    .input(publicInsertWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      const [workspaceCreateResult] = await ctx.db
        .insert(workspace)
        .values({
          ...input,
          planType: "hobby",
        })
        .returning();

      if (!workspaceCreateResult) {
        throw new Error("Failed to create workspace");
      }

      await ctx.db.insert(workspace_user).values({
        userId: ctx.session.user.userId,
        workspaceId: workspaceCreateResult.id,
        workspaceRole: "owner",
      });
      return workspaceCreateResult;
    }),

  updateWorkspace: workspaceProcedure
    .input(
      publicInsertWorkspaceSchema.merge(z.object({ workspaceId: z.string() })),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceId && ctx.workspaceId !== input.workspaceId) {
        throw new Error("Invalid workspace");
      }
      await ctx.db
        .update(workspace)
        .set(input)
        .where(eq(workspace.id, input.workspaceId));
    }),

  deleteWorkspaceById: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceId && ctx.workspaceId !== input.workspaceId) {
        throw new Error("Invalid workspace");
      }
      await ctx.db.delete(workspace).where(eq(workspace.id, input.workspaceId));
    }),

  getAllWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const workspaceIds = (
      await db.query.workspace_user.findMany({
        where: (workspace_user, { eq }) =>
          eq(workspace_user.userId, ctx.session.user.userId),
        columns: {
          workspaceId: true,
        },
      })
    ).map((workspace) => workspace.workspaceId);

    if (workspaceIds.length === 0) {
      return [];
    }

    return await db.query.workspace.findMany({
      where: (workspace, { inArray }) => inArray(workspace.id, workspaceIds),
    });
  }),

  getWorkspaceById: workspaceProcedure
    .meta({ openapi: { method: "GET", path: "/v1/workspaces/{workspaceId}" } })
    .input(z.object({ workspaceId: z.string() }))
    .output(selectWorkspaceSchema)
    .query(async ({ ctx, input }) => {
      if (ctx.workspaceId && ctx.workspaceId !== input.workspaceId) {
        throw new Error("Invalid workspace");
      }

      const result = await db.query.workspace.findFirst({
        where: (workspace, { eq }) => eq(workspace.id, input.workspaceId),
      });

      if (!result) {
        throw new Error("Workspace not found");
      }
      return result;
    }),
});
