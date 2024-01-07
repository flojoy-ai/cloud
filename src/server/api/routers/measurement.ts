import { type SQL, eq, lte, gte } from "drizzle-orm";
import _ from "lodash";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { measurement, device, test } from "~/server/db/schema";
import { selectDeviceSchema } from "~/types/device";
import {
  insertMeasurementSchema,
  publicInsertMeasurementSchema,
  selectMeasurementSchema,
} from "~/types/measurement";

export const measurementRouter = createTRPCRouter({
  createMeasurement: workspaceProcedure
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

  createMeasurements: workspaceProcedure
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

  getAllMeasurementsByTestId: workspaceProcedure
    .input(
      z.object({
        testId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .output(
      z.array(
        selectMeasurementSchema.merge(z.object({ device: selectDeviceSchema })),
      ),
    )
    .query(async ({ ctx, input }) => {
      const where: SQL[] = [eq(measurement.testId, input.testId)];

      if (input.startDate) {
        where.push(gte(measurement.createdAt, input.startDate));
      }
      if (input.endDate) {
        where.push(lte(measurement.createdAt, input.endDate));
      }

      const result = await ctx.db.query.measurement.findMany({
        where: (_, { and }) => and(...where),
        with: {
          device: true,
        },
      });
      return result;
    }),
});
