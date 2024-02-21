import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import {
  insertMeasurementSchema,
  selectMeasurementSchema,
} from "~/types/measurement";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { hardwareAccessMiddleware } from "./hardware";
import { testAccessMiddleware } from "./test";
import { type AccessContext, checkWorkspaceAccess } from "~/lib/auth";
import _ from "lodash";
import { withHardware, withTags } from "~/lib/query";
import { type SelectHardware } from "~/types/hardware";
import { MeasurementData } from "~/types/data";
import { createMeasurement } from "~/server/services/measurement";
import { optionalBool } from "~/lib/utils";
import { Kysely } from "kysely";
import type DB from "~/schemas/Database";
import { executeWithCursorPagination } from "kysely-paginate";
import { paginated } from "~/lib/db-utils";

export const measurementAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: AccessContext;
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

const filters = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  name: z.string().optional(),
  tags: z.string().array().optional(),
});

const measurementsByTestIdOptions = filters.extend({
  testId: z.string(),
});

const measurementsByHardwareIdOptions = filters.extend({
  hardwareId: z.string(),
  latest: optionalBool,
});

const buildMeasurementsByQuery = (
  db: Kysely<DB>,
  input: z.infer<typeof filters>,
  col: "hardwareId" | "testId",
  id: string,
) => {
  let query = db
    .selectFrom("measurement")
    .selectAll("measurement")
    .select((eb) => [withHardware(eb), withTags(eb)])
    .where(col, "=", id)
    .$narrowType<{ hardware: SelectHardware }>()
    .$narrowType<{ data: MeasurementData }>()
    .$if(input.tags !== undefined, (qb) =>
      qb
        .innerJoin(
          "measurement_tag as mt",
          "mt.measurementId",
          "measurement.id",
        )
        .innerJoin("tag", (join) => join.on("tag.name", "in", input.tags!)),
    );

  if (input.startDate) {
    query = query.where("measurement.createdAt", ">=", input.startDate);
  }

  if (input.endDate) {
    query = query.where("measurement.createdAt", "<=", input.endDate);
  }

  if (input.name) {
    query = query.where("measurement.name", "ilike", `%${input.name}%`);
  }

  return query;
};

const buildMeasurementsByTestIdQuery = (
  db: Kysely<DB>,
  input: z.infer<typeof measurementsByTestIdOptions>,
) => {
  return buildMeasurementsByQuery(db, input, "testId", input.testId);
};

const buildMeasurementsByHardwareIdQuery = (
  db: Kysely<DB>,
  input: z.infer<typeof measurementsByHardwareIdOptions>,
) => {
  let query = buildMeasurementsByQuery(
    db,
    input,
    "hardwareId",
    input.hardwareId,
  );

  if (input.latest) {
    query = query.orderBy("measurement.testId", "desc").distinctOn("testId");
  }

  return query.orderBy("measurement.createdAt", "desc");
};

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
    .input(measurementsByTestIdOptions)
    .use(testAccessMiddleware)
    .output(z.array(selectMeasurementSchema))
    .query(async ({ ctx, input }) => {
      return await buildMeasurementsByTestIdQuery(ctx.db, input).execute();
    }),

  getAllMeasurementsByTestIdPaginated: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/test/{testId}/paginate",
        tags: ["measurements"],
      },
    })
    .input(
      measurementsByTestIdOptions.extend({
        pageSize: z.number().default(10),
        after: z.string().optional(),
        before: z.string().optional(),
      }),
    )
    .use(testAccessMiddleware)
    .output(paginated(selectMeasurementSchema))
    .query(async ({ ctx, input }) => {
      const query = buildMeasurementsByTestIdQuery(ctx.db, input);
      return await executeWithCursorPagination(query, {
        perPage: input.pageSize,
        after: input.after,
        before: input.before,
        fields: [{ expression: "createdAt", direction: "desc" }],
        parseCursor: (cursor) => ({
          createdAt: new Date(cursor.createdAt),
        }),
      });
    }),

  getAllMeasurementsByHardwareId: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/hardware/{hardwareId}",
        tags: ["measurements"],
      },
    })
    .input(measurementsByHardwareIdOptions)
    .use(hardwareAccessMiddleware)
    .output(z.array(selectMeasurementSchema))
    .query(async ({ ctx, input }) => {
      return await buildMeasurementsByHardwareIdQuery(ctx.db, input).execute();
    }),

  getAllMeasurementsByHardwareIdPaginated: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/measurements/hardware/{hardwareId}/paginate",
        tags: ["measurements"],
      },
    })
    .input(
      measurementsByHardwareIdOptions.extend({
        pageSize: z.number().default(10),
        after: z.string().optional(),
        before: z.string().optional(),
      }),
    )
    .use(hardwareAccessMiddleware)
    .output(paginated(selectMeasurementSchema))
    .query(async ({ ctx, input }) => {
      const query = buildMeasurementsByHardwareIdQuery(ctx.db, input);
      return await executeWithCursorPagination(query, {
        perPage: input.pageSize,
        after: input.after,
        before: input.before,
        fields: [{ expression: "createdAt", direction: "desc" }],
        parseCursor: (cursor) => ({
          createdAt: new Date(cursor.createdAt),
        }),
      });
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
