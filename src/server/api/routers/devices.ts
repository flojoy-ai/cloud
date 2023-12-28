import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { device } from "~/server/db/schema";

export const deviceRouter = createTRPCRouter({
  // TODO: make sure no duplicated names
  createDevice: protectedProcedure
    .input(z.object({ name: z.string(), projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deviceCreateResult] = await ctx.db
        .insert(device)
        .values({
          name: input.name,
          projectID: input.projectId,
        })
        .returning();

      if (!deviceCreateResult) {
        throw new Error("Failed to create device");
      }
    }),
});
