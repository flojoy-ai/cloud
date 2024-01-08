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
          project: {
            with: {
              workspace: true,
            },
          },
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

  // There are 2 cases:
  // Case 1: Authentication with secret key, in this case workspaceId will be
  // defined in the ctx, thus just need to check if the resource belongs to that
  // workspace, then we will be done.
  if (
    opts.ctx.workspaceId &&
    measurement.device.project.workspace.id !== opts.ctx.workspaceId
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this measurement",
    });
  }

  // Case 2: Authentication with session, in this case we need to check if the
  // has access to the workspace that this resource belongs to
  if (!opts.ctx.workspaceId) {
    const perm = await opts.ctx.db.query.workspace_user.findFirst({
      where: (workspace_user, { and, eq }) =>
        and(
          eq(
            workspace_user.workspaceId,
            measurement.device.project.workspace.id,
          ),
          eq(workspace_user.userId, opts.ctx.userId),
        ),
    });
    if (!perm) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have access to this measurement",
      });
    }
  }

  return opts.next();
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
            storageProvider: "local", // TODO: make this configurable
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
        storageProvider: "local" as const, // TODO: make this configurable
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
});
