import { type SQL, eq, lte, gte } from "drizzle-orm";
import _ from "lodash";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { measurement, device, test } from "~/server/db/schema";
import { selectDeviceSchema } from "~/types/device";
import {
  publicInsertMeasurementSchema,
  selectMeasurementSchema,
} from "~/types/measurement";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { type db } from "~/server/db";
import { deviceAccessMiddleware } from "./devices";
import { testAccessMiddleware } from "./test";
import { checkWorkspaceAccess } from "~/lib/auth";

export const measurementAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { measurementId: string };
}>().create(async (opts) => {
  const measurement = await opts.ctx.db.query.measurement.findFirst({
    where: (measurement, { eq }) =>
      eq(measurement.id, opts.input.measurementId),
    with: {
      device: {
        with: {
          workspace: true,
        },
      },
    },
  });

  if (!measurement) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Measurement not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    measurement.device.workspace.id,
  );
  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this measurement",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      workspaceId: workspaceUser.workspaceId,
      measurementId: measurement.id,
    },
  });
});

export const measurementRouter = createTRPCRouter({
  createMeasurement: workspaceProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/v1/measurements/",
        tags: ["measurement"],
      },
    })
    .input(publicInsertMeasurementSchema)
    .use(deviceAccessMiddleware)
    .use(testAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [measurementCreateResult] = await tx
          .insert(measurement)
          .values({
            ...input,
            storageProvider: "postgres", // TODO: make this configurable
          })
          .returning();

        if (!measurementCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurement",
          });
        }

        await tx
          .update(test)
          .set({ updatedAt: new Date() })
          .where(eq(test.id, input.testId));

        await tx
          .update(device)
          .set({ updatedAt: new Date() })
          .where(eq(device.id, input.deviceId));
      });
    }),

  // TODO: remove this
  _createMeasurements: workspaceProcedure
    .input(z.array(publicInsertMeasurementSchema))
    .mutation(async ({ ctx, input }) => {
      const measurements = input.map((m) => ({
        ...m,
        storageProvider: "postgres" as const, // TODO: make this configurable
      }));

      const measurementsCreateResult = await ctx.db
        .insert(measurement)
        .values([...measurements])
        .returning();

      if (!measurementsCreateResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create measurements",
        });
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
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/",
        tags: ["measurement"],
      },
    })
    .input(
      z.object({
        testId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .use(testAccessMiddleware)
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

  getMeasurementById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/{measurementId}",
        tags: ["measurement"],
      },
    })
    .input(
      z.object({
        measurementId: z.string(),
      }),
    )
    .use(measurementAccessMiddleware)
    .output(
      selectMeasurementSchema.merge(z.object({ device: selectDeviceSchema })),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.measurement.findFirst({
        where: () => eq(measurement.id, input.measurementId),
        with: {
          device: true,
        },
      });

      if (result === undefined) {
        throw new TRPCError({
          message: "Measurement not found",
          code: "BAD_REQUEST",
        });
      }
      return result;
    }),
});
