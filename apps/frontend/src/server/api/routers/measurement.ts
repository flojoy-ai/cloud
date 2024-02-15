import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import {
  insertMeasurementSchema,
  selectMeasurementSchema,
} from "~/types/measurement";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { type db } from "~/server/db";
import { hardwareAccessMiddleware } from "./hardware";
import { testAccessMiddleware } from "./test";
import { checkWorkspaceAccess } from "~/lib/auth";
import _ from "lodash";
import { createMeasurement, withHardware, withTags } from "~/lib/query";
import { type SelectHardware } from "~/types/hardware";
import { MeasurementData } from "~/types/data";

export const measurementAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { measurementId: string };
}>().create(async (opts) => {
  const measurement = await opts.ctx.db
    .selectFrom("measurement")
    .where("measurement.id", "=", opts.input.measurementId)
    .innerJoin("hardware", "measurement.hardwareId", "hardware.id")
    .selectAll("measurement")
    .select("hardware.workspaceId")
    .executeTakeFirstOrThrow(
      () =>
        new TRPCError({
          code: "BAD_REQUEST",
          message: "Measurement not found",
        }),
    );

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    measurement.workspaceId,
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
        tags: ["measurements"],
      },
    })
    .input(insertMeasurementSchema)
    .use(hardwareAccessMiddleware)
    .use(testAccessMiddleware)
    .output(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction().execute(async (tx) => {
        return await createMeasurement(tx, ctx.workspaceId, input);
      });
    }),

  getAllMeasurementsByTestId: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/test/{testId}",
        tags: ["measurements"],
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
    .output(z.array(selectMeasurementSchema))
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .selectFrom("measurement")
        .selectAll("measurement")
        .select((eb) => [withHardware(eb), withTags(eb)])
        .where("testId", "=", input.testId)
        .$narrowType<{ hardware: SelectHardware }>()
        .$narrowType<{ data: MeasurementData }>();

      if (input.startDate) {
        query = query.where("createdAt", ">=", input.startDate);
      }

      if (input.endDate) {
        query = query.where("createdAt", "<=", input.endDate);
      }

      return await query.execute();
    }),

  getAllMeasurementsByHardwareId: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/hardware/{hardwareId}",
        tags: ["measurements"],
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
    .output(z.array(selectMeasurementSchema))
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .selectFrom("measurement")
        .selectAll("measurement")
        .where("hardwareId", "=", input.hardwareId)
        .select((eb) => [withHardware(eb), withTags(eb)])
        .$narrowType<{ hardware: SelectHardware }>()
        .$narrowType<{ data: MeasurementData }>()
        .orderBy("createdAt", "desc");

      if (input.startDate) {
        query = query.where("createdAt", ">=", input.startDate);
      }

      if (input.endDate) {
        query = query.where("createdAt", "<=", input.endDate);
      }

      const result = await query.execute();

      if (input.latest) {
        return _.values(_.groupBy(result, (meas) => meas.testId)).map(
          (meas) => meas[0]!,
        );
      }

      return result;
    }),

  getMeasurement: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/{measurementId}",
        tags: ["measurements"],
      },
    })
    .input(
      z.object({
        measurementId: z.string(),
      }),
    )
    .use(measurementAccessMiddleware)
    .output(selectMeasurementSchema)
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .selectFrom("measurement")
        .selectAll("measurement")
        .where("id", "=", input.measurementId)
        .select((eb) => [withHardware(eb), withTags(eb)])
        .$narrowType<{ hardware: SelectHardware }>()
        .$narrowType<{ data: MeasurementData }>()
        .executeTakeFirst();

      if (result === undefined) {
        throw new TRPCError({
          message: "Measurement not found",
          code: "BAD_REQUEST",
        });
      }

      return result;
    }),

  deleteMeasurement: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/measurements/{measurementId}",
        tags: ["measurements"],
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
        .deleteFrom("measurement")
        .where("measurement.id", "=", input.measurementId)
        .execute();
    }),
});
