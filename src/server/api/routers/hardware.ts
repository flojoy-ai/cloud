import {
  and,
  eq,
  exists,
  getTableColumns,
  inArray,
  not,
  sql,
} from "drizzle-orm";
import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import _ from "lodash";
import { checkWorkspaceAccess } from "~/lib/auth";
import { getSystemModelParts } from "~/lib/query";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  deviceTable,
  hardwareTable,
  modelTable,
  projectHardwareTable,
  systemTable,
  systemDeviceTable,
  workspaceTable,
} from "~/server/db/schema";
import {
  publicInsertDeviceSchema,
  publicInsertSystemSchema,
  selectHardwareSchema,
  selectDeviceSchema,
  selectSystemSchema,
  selectHardwareBaseSchema,
  publicUpdateHardwareSchema,
} from "~/types/hardware";
import { selectMeasurementSchema } from "~/types/measurement";
import { workspaceAccessMiddleware } from "./workspace";

export const hardwareAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { hardwareId: string };
}>().create(async (opts) => {
  const hardware = await opts.ctx.db.query.hardwareTable.findFirst({
    where: (hardware, { eq }) => eq(hardware.id, opts.input.hardwareId),
    with: {
      workspace: true,
    },
  });

  if (!hardware) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Device not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    hardware.workspace.id,
  );

  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this device",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: { workspaceId: workspaceUser.workspaceId, hardwareId: hardware.id },
  });
});

export const hardwareRouter = createTRPCRouter({
  createDevice: workspaceProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/v1/hardware/devices",
        tags: ["hardware", "device"],
      },
    })
    .input(publicInsertDeviceSchema)
    .use(workspaceAccessMiddleware)
    .output(selectHardwareSchema)
    .mutation(async ({ ctx, input }) => {
      const model = await db.query.modelTable.findFirst({
        where: (model, { eq }) => eq(model.id, input.modelId),
      });

      if (model === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid model ID",
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const [hardwareCreateResult] = await tx
          .insert(hardwareTable)
          .values(input)
          .returning();

        if (!hardwareCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create device",
          });
        }

        const [deviceCreateResult] = await tx
          .insert(deviceTable)
          .values({
            id: hardwareCreateResult.id,
          })
          .returning();

        if (!deviceCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create device",
          });
        }

        if (input.projectId) {
          await tx.insert(projectHardwareTable).values({
            projectId: input.projectId,
            hardwareId: hardwareCreateResult.id,
          });
        }

        await tx
          .update(workspaceTable)
          .set({ updatedAt: new Date() })
          .where(eq(workspaceTable.id, input.workspaceId));

        return {
          ...hardwareCreateResult,
          model,
        };
      });
    }),

  createSystem: workspaceProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/v1/hardware/systems",
        tags: ["hardware", "system"],
      },
    })
    .input(publicInsertSystemSchema)
    .use(workspaceAccessMiddleware)
    .output(selectHardwareSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Refactor this massive query
      const deviceParts = await getSystemModelParts(input.modelId);

      if (deviceParts === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid model ID",
        });
      }

      const notUsed = not(
        exists(
          db
            .select()
            .from(systemDeviceTable)
            .where(inArray(systemDeviceTable.deviceId, input.deviceIds)),
        ),
      );

      const selectResult = await ctx.db
        .select()
        .from(deviceTable)
        .innerJoin(hardwareTable, eq(hardwareTable.id, deviceTable.id))
        .where(and(inArray(deviceTable.id, input.deviceIds), notUsed));

      if (selectResult.length !== input.deviceIds.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Invalid device IDs, or some devices are already used in an existing system.",
        });
      }

      const partCounts = _.countBy(selectResult, (x) => x.hardware.modelId);

      const matchesModel = deviceParts.every(
        ({ modelId, count }) => partCounts[modelId] === count,
      );

      if (!matchesModel) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Devices given for system do not match model.",
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const [hardwareCreateResult] = await tx
          .insert(hardwareTable)
          .values(input)
          .returning();

        if (!hardwareCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create device",
          });
        }

        const [systemCreateResult] = await tx
          .insert(systemTable)
          .values({
            id: hardwareCreateResult.id,
          })
          .returning();

        if (!systemCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create system",
          });
        }

        if (input.projectId) {
          await tx.insert(projectHardwareTable).values({
            projectId: input.projectId,
            hardwareId: hardwareCreateResult.id,
          });
        }

        await tx.insert(systemDeviceTable).values(
          input.deviceIds.map((deviceId) => ({
            systemId: systemCreateResult.id,
            deviceId,
          })),
        );

        await tx
          .update(workspaceTable)
          .set({ updatedAt: new Date() })
          .where(eq(workspaceTable.id, input.workspaceId));

        const model = await tx.query.modelTable.findFirst({
          where: (model, { eq }) => eq(model.id, input.modelId),
        });

        if (!model) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Model not found, this shouldn't happen",
          });
        }

        return {
          ...hardwareCreateResult,
          model,
        };
      });
    }),

  getHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/hardware/{hardwareId}",
        tags: ["device"],
      },
    })
    .input(z.object({ hardwareId: z.string() }))
    .use(hardwareAccessMiddleware)
    .output(
      selectHardwareBaseSchema.merge(
        z.object({
          measurements: z.array(
            selectMeasurementSchema.merge(
              z.object({
                hardware: selectHardwareSchema,
              }),
            ),
          ),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.hardwareTable.findFirst({
        where: (hardware, { eq }) => eq(hardware.id, input.hardwareId),
        with: {
          model: true,
          measurements: {
            with: {
              test: true,
              hardware: {
                with: {
                  model: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hardware not found",
        });
      }

      return result;
    }),

  getAllHardware: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/hardware", tags: ["hardware"] },
    })
    .input(
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
        onlyAvailable: z.boolean().optional(),
      }),
    )
    .use(workspaceAccessMiddleware)
    .output(z.array(selectHardwareSchema))
    .query(async ({ input }) => {
      const devices = await getAllDevices(
        input.workspaceId,
        input.projectId,
        input.onlyAvailable,
      );
      const systems = await getAllSystems(input.workspaceId, input.projectId);
      return [...devices, ...systems];
    }),

  getAllDevices: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/hardware/all/devices",
        tags: ["hardware"],
      },
    })
    .input(
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
        onlyAvailable: z.boolean().optional(),
      }),
    )
    .use(workspaceAccessMiddleware)
    .output(z.array(selectDeviceSchema))
    .query(async ({ input }) => {
      return await getAllDevices(
        input.workspaceId,
        input.projectId,
        input.onlyAvailable,
      );
    }),

  getAllSystems: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/hardware/all/systems",
        tags: ["hardware"],
      },
    })
    .input(
      z.object({
        workspaceId: z.string(),
        projectId: z.string().optional(),
      }),
    )
    .use(workspaceAccessMiddleware)
    .output(z.array(selectSystemSchema))
    .query(async ({ input }) => {
      return await getAllSystems(input.workspaceId, input.projectId);
    }),

  deleteHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/hardware/{hardwareId}",
        tags: ["hardware"],
      },
    })
    .input(z.object({ hardwareId: z.string() }))
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .delete(hardwareTable)
        .where(eq(hardwareTable.id, input.hardwareId));
    }),

  updateHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/v1/hardware/{hardwareId}",
        tags: ["hardware"],
      },
    })
    .input(publicUpdateHardwareSchema)
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(hardwareTable)
        .set({ name: input.name })
        .where(eq(hardwareTable.id, input.hardwareId));
    }),

  // TODO: Add update remove system components
});

async function getAllDevices(
  workspaceId: string,
  projectId?: string,
  onlyAvailable?: boolean,
) {
  const conditions = [eq(hardwareTable.workspaceId, workspaceId)];
  if (onlyAvailable) {
    const notUsed = not(
      exists(
        db
          .select()
          .from(systemDeviceTable)
          .where(eq(systemDeviceTable.deviceId, deviceTable.id)),
      ),
    );
    conditions.push(notUsed);
  }

  const hardwares = db
    .select({ ...getTableColumns(hardwareTable) })
    .from(hardwareTable)
    .innerJoin(deviceTable, eq(hardwareTable.id, deviceTable.id))
    .where(and(...conditions));
  const temp = hardwares.as("hardwares");

  const query = db
    .select({
      type: sql<"device">`'device'`.as("type"),
      name: temp.name,
      workspaceId: temp.workspaceId,
      createdAt: temp.createdAt,
      updatedAt: temp.updatedAt,
      modelId: temp.modelId,
      id: temp.id,
      model: getTableColumns(modelTable),
    })
    .from(temp);

  if (projectId) {
    const projects_hardwares = db
      .select()
      .from(projectHardwareTable)
      .where(eq(projectHardwareTable.projectId, projectId))
      .as("projects_hardwares");

    void query.innerJoin(
      projects_hardwares,
      eq(temp.id, projects_hardwares.hardwareId),
    );
  }
  return await query.innerJoin(modelTable, eq(modelTable.id, temp.modelId));
}

async function getAllSystems(workspaceId: string, projectId?: string) {
  // FIXME: Can't use subqueries for this query to do it all at once...
  // drizzle bug complains about ambiguous columns
  // see: https://github.com/drizzle-team/drizzle-orm/issues/1242jk

  // const sq = db
  //   .select({
  //     id: hardware.id,
  //     name: hardware.name,
  //     model: getTableColumns(model),
  //   })
  //   .from(hardware)
  //   .innerJoin(device, eq(device.id, hardware.id))
  //   .innerJoin(model, eq(model.id, hardware.modelId))
  //   .where(eq(hardware.workspaceId, workspaceId))
  //   .as("sq");

  const query = db
    .select({
      type: sql<"system">`'system'`.as("type"),
      id: hardwareTable.id,
      name: hardwareTable.name,
      workspaceId: hardwareTable.workspaceId,
      createdAt: hardwareTable.createdAt,
      updatedAt: hardwareTable.updatedAt,
      modelId: hardwareTable.modelId,
      model: getTableColumns(modelTable),
      // parts: sql<
      //   SystemPart[]
      // >`json_agg(json_build_object('modelId', ${sq.id}, 'name', ${sq.name}))`,
    })
    .from(hardwareTable)
    .innerJoin(systemTable, eq(hardwareTable.id, systemTable.id))
    .where(eq(hardwareTable.workspaceId, workspaceId));

  if (projectId) {
    const projects_hardwares = db
      .select()
      .from(projectHardwareTable)
      .where(eq(projectHardwareTable.projectId, projectId))
      .as("projects_hardwares");

    void query.innerJoin(
      projects_hardwares,
      eq(hardwareTable.id, projects_hardwares.hardwareId),
    );
  }

  const systems = await query.innerJoin(
    modelTable,
    eq(modelTable.id, hardwareTable.modelId),
  );
  // .innerJoin(system_device, eq(hardware.id, system_device.systemId))
  // .innerJoin(device, eq(device.id, system_device.deviceId))
  // .innerJoin(sq, eq(sq.id, device.id))
  // .groupBy(hardware.id, model.id);

  return await Promise.all(
    systems.map(async (sys) => {
      const sq = db
        .select()
        .from(systemDeviceTable)
        .where(eq(systemDeviceTable.systemId, sys.id))
        .as("sq");

      const parts = await db
        .select({
          id: hardwareTable.id,
          name: hardwareTable.name,
          model: getTableColumns(modelTable),
        })
        .from(hardwareTable)
        .innerJoin(sq, eq(hardwareTable.id, sq.deviceId))
        .innerJoin(modelTable, eq(modelTable.id, hardwareTable.modelId));

      return {
        ...sys,
        parts,
      };
    }),
  );
}
