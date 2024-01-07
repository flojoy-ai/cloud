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
