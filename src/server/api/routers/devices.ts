import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { device, project } from "~/server/db/schema";
import { insertDeviceSchema } from "~/types/device";

export const deviceRouter = createTRPCRouter({
  // TODO: make sure no duplicated names
  createDevice: protectedProcedure
    .input(insertDeviceSchema)
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

      await ctx.db
        .update(project)
        .set({ updatedAt: new Date() })
        .where(eq(project.id, input.projectId));

      return deviceCreateResult;
    }),
  getAllDevicesByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.device.findMany({
        where: (device, { eq }) => eq(device.projectId, input.projectId),
      });
    }),
});
