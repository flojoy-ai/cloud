import { type SQL, eq, lte, gte } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { measurement, hardware, test } from "~/server/db/schema";
import { selectHardwareSchema } from "~/types/hardware";
import {
  publicInsertMeasurementSchema,
  selectMeasurementSchema,
} from "~/types/measurement";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { type db } from "~/server/db";
import { hardwareAccessMiddleware } from "./hardware";
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
      hardware: {
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
    measurement.hardware.workspace.id,
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
    .use(hardwareAccessMiddleware)
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
          .update(hardware)
          .set({ updatedAt: new Date() })
          .where(eq(hardware.id, input.hardwareId));
      });
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
        selectMeasurementSchema.merge(
          z.object({
            hardware: selectHardwareSchema,
          }),
        ),
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
          hardware: {
            with: {
              model: true,
            },
          },
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
      selectMeasurementSchema.merge(
        z.object({ hardware: selectHardwareSchema }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.measurement.findFirst({
        where: () => eq(measurement.id, input.measurementId),
        with: {
          hardware: { with: { model: true } },
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
