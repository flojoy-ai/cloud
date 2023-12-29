import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { project, test } from "~/server/db/schema";
import { insertTestSchema } from "~/types/test";

export const testRouter = createTRPCRouter({
  // TODO: make sure no duplicated names
  createTest: protectedProcedure
    .input(insertTestSchema)
    .mutation(async ({ ctx, input }) => {
      const [testCreateResult] = await ctx.db
        .insert(test)
        .values({
          name: input.name,
          projectId: input.projectId,
        })
        .returning();

      if (!testCreateResult) {
        throw new Error("Failed to create test");
      }

      await ctx.db
        .update(project)
        .set({ updatedAt: new Date() })
        .where(eq(project.id, input.projectId));
    }),
  getAllTestsByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.test.findMany({
        where: (test, { eq }) => eq(test.projectId, input.projectId),
      });
    }),
});
