import { eq } from "drizzle-orm";
import _ from "lodash";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { measurement, device, test } from "~/server/db/schema";
import {
  insertMeasurementSchema,
  publicInsertMeasurementSchema,
  selectMeasurementSchema,
} from "~/types/measurement";

export const measurementRouter = createTRPCRouter({
  createMeasurement: protectedProcedure
    .input(insertMeasurementSchema)
    .mutation(async ({ ctx, input }) => {
      const [measurementCreateResult] = await ctx.db
        .insert(measurement)
        .values({
          ...input,
          storageProvider: "local", // TODO: make this configurable
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
        .where(eq(device.id, input.deviceId));
    }),

  createMeasurements: protectedProcedure
    .input(z.array(publicInsertMeasurementSchema))
    .mutation(async ({ ctx, input }) => {
      const measurements = input.map((m) => ({
        ...m,
        storageProvider: "local" as const, // TODO: make this configurable
      }));

      const measurementsCreateResult = await ctx.db
        .insert(measurement)
        .values([...measurements])
        .returning();

      if (!measurementsCreateResult) {
        throw new Error("Failed to create measurements");
      }

      await Promise.all(
        _.uniq(input.map((measurement) => measurement.testId)).map(
          async (testId) => {
            await ctx.db
              .update(test)
              .set({ updatedAt: new Date() })
              .where(eq(test.id, testId));
          },
        ),
      );

      await Promise.all(
        _.uniq(input.map((measurement) => measurement.deviceId)).map(
          async (deviceId) => {
            await ctx.db
              .update(device)
              .set({ updatedAt: new Date() })
              .where(eq(device.id, deviceId));
          },
        ),
      );
    }),

  getAllMeasurementsByTestId: protectedProcedure
    .input(z.object({ testId: z.string() }))
    // .output(z.array(selectMeasurementSchema))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.measurement.findMany({
        where: (measurement, { eq }) => eq(measurement.testId, input.testId),
        with: {
          device: true,
        },
      });
      return result;
    }),
});
