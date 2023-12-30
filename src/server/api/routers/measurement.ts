import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { measurement, device, test } from "~/server/db/schema";
import { insertMeasurementSchema } from "~/types/measurement";

export const measurementRouter = createTRPCRouter({
  createMeasurement: protectedProcedure
    .input(insertMeasurementSchema)
    .mutation(async ({ ctx, input }) => {
      const [measurementCreateResult] = await ctx.db
        .insert(measurement)
        .values({
          name: input.name,
          testId: input.testId,
          deviceId: input.deviceId,
          measurementType: input.measurementType,
          storageProvider: "local", // TODO: make this configurable
          data: input.data,
        })
        .returning();

      if (!measurementCreateResult) {
        throw new Error("Failed to create measurement");
      }

      await ctx.db
        .update(test)
        .set({ updatedAt: new Date() })
        .where(eq(test.id, input.testId));

      await ctx.db
        .update(device)
        .set({ updatedAt: new Date() })
        .where(eq(device.id, input.testId));
    }),
  getAllMeasurementsByTestId: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.measurement.findMany({
        where: (measurement, { eq }) => eq(measurement.testId, input.testId),
      });
    }),
});
