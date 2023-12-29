import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
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
          projectId: input.projectId,
        })
        .returning();

      if (!deviceCreateResult) {
        throw new Error("Failed to create device");
      }
    }),
  getAllDevicesByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await db.query.device.findMany({
        where: (device, { eq }) => eq(device.projectId, input.projectId),
      });
    }),
});
