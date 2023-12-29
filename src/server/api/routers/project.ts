import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { project, workspace } from "~/server/db/schema";

export const projectRouter = createTRPCRouter({
  // TODO: make sure no duplicated names
  createProject: protectedProcedure
    .input(z.object({ name: z.string(), workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [projectCreateResult] = await ctx.db
        .insert(project)
        .values({
          name: input.name,
          workspaceId: input.workspaceId,
        })
        .returning();

      if (!projectCreateResult) {
        throw new Error("Failed to create project");
      }

      await ctx.db
        .update(workspace)
        .set({ updatedAt: new Date() })
        .where(eq(workspace.id, input.workspaceId));
    }),
  getAllProjectsByWorkspaceId: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.project.findMany({
        where: (project, { eq }) => eq(project.workspaceId, input.workspaceId),
      });
    }),
});
