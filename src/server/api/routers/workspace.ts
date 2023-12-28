import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
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
        userID: ctx.session.user.userId,
        workspaceID: workspaceCreateResult.id,
        workspaceRole: "owner",
      });
    }),
});
