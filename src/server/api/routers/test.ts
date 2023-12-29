import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { test } from "~/server/db/schema";

export const testRouter = createTRPCRouter({
  // TODO: make sure no duplicated names
  createTest: protectedProcedure
    .input(z.object({ name: z.string(), projectId: z.string() }))
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
    }),
});
