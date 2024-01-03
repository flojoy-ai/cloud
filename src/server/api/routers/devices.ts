import { eq } from "drizzle-orm";
import { z } from "zod";

import _ from "lodash";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { device, project } from "~/server/db/schema";
import { publicInsertDeviceSchema, selectDeviceSchema } from "~/types/device";
import { selectMeasurementSchema } from "~/types/measurement";

export const deviceRouter = createTRPCRouter({
  createDevice: protectedProcedure
    .input(publicInsertDeviceSchema)
    .output(selectDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      const [deviceCreateResult] = await ctx.db
        .insert(device)
        .values(input)
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

  createDevices: protectedProcedure
    .input(z.array(publicInsertDeviceSchema))
    .output(z.array(selectDeviceSchema))
    .mutation(async ({ ctx, input }) => {
      const devicesCreateResult = await ctx.db
        .insert(device)
        .values([...input])
        .returning();

      if (!devicesCreateResult) {
        throw new Error("Failed to create devices");
      }

      await Promise.all(
        _.uniq(input.map((device) => device.projectId)).map(
          async (projectId) => {
            await ctx.db
              .update(project)
              .set({ updatedAt: new Date() })
              .where(eq(project.id, projectId));
          },
        ),
      );

      return devicesCreateResult;
    }),

  getDeviceById: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .output(
      selectDeviceSchema.merge(
        z.object({ measurements: z.array(selectMeasurementSchema) }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.device.findFirst({
        where: (device, { eq }) => eq(device.id, input.deviceId),
        with: {
          measurements: true,
        },
      });

      if (!result) {
        throw new Error("Failed to find device");
      }

      return result;
    }),

  getAllDevicesByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .output(z.array(selectDeviceSchema))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.device.findMany({
        where: (device, { eq }) => eq(device.projectId, input.projectId),
      });
    }),
});
