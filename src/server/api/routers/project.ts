import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { project } from "~/server/db/schema";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(z.object({ name: z.string(), workspaceID: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [projectCreateResult] = await ctx.db
        .insert(project)
        .values({
          name: input.name,
          workspaceID: input.workspaceID,
        })
        .returning();

      if (!projectCreateResult) {
        throw new Error("Failed to create project");
      }
    }),
});
