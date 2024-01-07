import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { project, workspace } from "~/server/db/schema";
import {
  publicInsertProjectSchema,
  selectProjectSchema,
} from "~/types/project";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(publicInsertProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const [projectCreateResult] = await ctx.db
        .insert(project)
        .values(input)
        .returning();

      if (!projectCreateResult) {
        throw new Error("Failed to create project");
      }

      await ctx.db
        .update(workspace)
        .set({ updatedAt: new Date() })
        .where(eq(workspace.id, input.workspaceId));
      return projectCreateResult;
    }),

  getProjectById: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .output(selectProjectSchema)
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.project.findFirst({
        where: (project, { eq }) => eq(project.id, input.projectId),
      });
      if (!result) {
        throw new Error("Project not found");
      }
      return result;
    }),
  getAllProjectsByWorkspaceId: workspaceProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.project.findMany({
      where: (project, { eq }) => eq(project.workspaceId, ctx.workspaceId),
    });
  }),
});
