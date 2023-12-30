import { eq } from "drizzle-orm";
import _ from "lodash";
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

  createMeasurements: protectedProcedure
    .input(z.array(insertMeasurementSchema))
    .mutation(async ({ ctx, input }) => {
      const measurementsCreateResult = await ctx.db
        .insert(measurement)
        .values([...input])
        .returning();

      if (!measurementsCreateResult) {
        throw new Error("Failed to create measurements");
      }

      await Promise.all(
        _.uniq(input.flatMap((measurement) => measurement.testId)).map(
          async (projectId) => {
            await ctx.db
              .update(test)
              .set({ updatedAt: new Date() })
              .where(eq(test.projectId, projectId));
          },
        ),
      );

      await Promise.all(
        _.uniq(input.flatMap((measurement) => measurement.deviceId)).map(
          async (projectId) => {
            await ctx.db
              .update(device)
              .set({ updatedAt: new Date() })
              .where(eq(device.projectId, projectId));
          },
        ),
      );
    }),

  getAllMeasurementsByTestId: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.measurement.findMany({
        where: (measurement, { eq }) => eq(measurement.testId, input.testId),
      });
    }),
});
