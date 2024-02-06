import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { insertMeasurementSchema } from "~/types/measurement";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { type db } from "~/server/db";
import { hardwareAccessMiddleware } from "./hardware";
import { testAccessMiddleware } from "./test";
import { checkWorkspaceAccess } from "~/lib/auth";
import _ from "lodash";
import { createId } from "@paralleldrive/cuid2";
import { measurement } from "~/schemas/public/Measurement";
import { markUpdatedAt } from "~/lib/query";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { hardware } from "~/schemas/public/Hardware";
import { generateDatabaseId } from "~/lib/id";

export const measurementAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { measurementId: string };
}>().create(async (opts) => {
  const [measurement] = await opts.ctx.db
    .selectFrom("measurement")
    .where("measurement.id", "=", opts.input.measurementId)
    .innerJoin("hardware", "measurement.hardwareId", "hardware.id")
    .selectAll("measurement")
    .select("hardware.workspaceId")
    .execute();

  if (!measurement) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Measurement not found",
    });
  }

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
        tags: ["measurement"],
      },
    })
    .input(insertMeasurementSchema)
    .use(hardwareAccessMiddleware)
    .use(testAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction().execute(async (tx) => {
        const [res] = await tx
          .insertInto("measurement")
          .values({
            id: generateDatabaseId("measurement"),
            storageProvider: "postgres",
            ...input,
          })
          .returning("id")
          .execute();

        if (!res) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurement",
          });
        }

        await markUpdatedAt(tx, "test", input.testId);
        await markUpdatedAt(tx, "hardware", input.hardwareId);
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
    .output(z.array(measurement))
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .selectFrom("measurement")
        .selectAll("measurement")
        .where("testId", "=", input.testId);

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
    .output(z.array(measurement))
    .query(async ({ ctx, input }) => {
      let query = ctx.db
        .selectFrom("measurement")
        .selectAll("measurement")
        .where("hardwareId", "=", input.hardwareId);

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
    .output(measurement.extend({ hardware: hardware }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .selectFrom("measurement")
        .selectAll()
        .where("id", "=", input.measurementId)
        .innerJoin("hardware as h", "measurement.hardwareId", "h.id")
        .select((eb) =>
          jsonObjectFrom(eb.selectFrom("h").selectAll()).as("hardware"),
        )
        .execute();
      // .select(
      //   jsonObjectFrom('').as("hardware"),
      // )
      // .execute();

      // const result = await ctx.db.query.measurementTable.findFirst({
      //   where: () => eq(measurementTable.id, input.measurementId),
      //   with: {
      //     hardware: { with: { model: true } },
      //   },
      // });

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
