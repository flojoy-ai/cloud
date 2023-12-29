import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { project } from "~/server/db/schema";

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
    }),
  getAllProjects: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db.query.project.findMany({
        where: (project, { eq }) => eq(project.workspaceId, input.workspaceId),
      });
    }),
});
