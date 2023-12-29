import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspace, workspace_user } from "~/server/db/schema";

export const workspaceRouter = createTRPCRouter({
  // TODO: make sure no duplicated names
  createWorkspace: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [workspaceCreateResult] = await ctx.db
        .insert(workspace)
        .values({
          name: input.name,
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
    ).flatMap((workspace) => workspace.workspaceId);

    return await db.query.workspace.findMany({
      where: (workspace, { inArray }) => inArray(workspace.id, workspaceIds),
    });
  }),
});
