import { type SQL, eq, lte, gte, desc } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { measurementTable, hardwareTable, testTable } from "~/server/db/schema";
import { selectHardwareSchema } from "~/types/hardware";
import {
  publicInsertMeasurementSchema,
  selectMeasurementSchema,
} from "~/types/measurement";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { hardwareAccessMiddleware } from "./hardware";
import { testAccessMiddleware } from "./test";
import { type AccessContext, checkWorkspaceAccess } from "~/lib/auth";
import _ from "lodash";

export const measurementAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: AccessContext;
  input: { measurementId: string };
}>().create(async (opts) => {
  const measurement = await opts.ctx.db.query.measurementTable.findFirst({
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
      workspaceUser,
      measurement,
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
          .insert(measurementTable)
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
          .update(testTable)
          .set({ updatedAt: new Date() })
          .where(eq(testTable.id, input.testId));

        await tx
          .update(hardwareTable)
          .set({ updatedAt: new Date() })
          .where(eq(hardwareTable.id, input.hardwareId));
      });
    }),

  getAllMeasurementsByTestId: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/test/{testId}",
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
      const where: SQL[] = [eq(measurementTable.testId, input.testId)];

      if (input.startDate) {
        where.push(gte(measurementTable.createdAt, input.startDate));
      }
      if (input.endDate) {
        where.push(lte(measurementTable.createdAt, input.endDate));
      }

      const result = await ctx.db.query.measurementTable.findMany({
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

  getAllMeasurementsByHardwareId: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/hardware/{hardwareId}",
        tags: ["measurement"],
      },
    })
    .input(
      z.object({
        hardwareId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        latest: z.boolean().optional(),
      }),
    )
    .use(hardwareAccessMiddleware)
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
      const where: SQL[] = [eq(measurementTable.hardwareId, input.hardwareId)];

      if (input.startDate) {
        where.push(gte(measurementTable.createdAt, input.startDate));
      }
      if (input.endDate) {
        where.push(lte(measurementTable.createdAt, input.endDate));
      }

      const result = await ctx.db.query.measurementTable.findMany({
        where: (_, { and }) => and(...where),
        orderBy: (row) => desc(row.createdAt),
        with: {
          hardware: {
            with: {
              model: true,
            },
          },
        },
      });

      if (input.latest) {
        return _.values(_.groupBy(result, (meas) => meas.testId)).map(
          (meas) => meas[0]!,
        );
      }

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
      const result = await ctx.db.query.measurementTable.findFirst({
        where: () => eq(measurementTable.id, input.measurementId),
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

  deleteMeasurementById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
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
    .output(z.void())
    .query(async ({ ctx, input }) => {
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      await ctx.db
        .delete(measurementTable)
        .where(eq(measurementTable.id, input.measurementId));
    }),
});
