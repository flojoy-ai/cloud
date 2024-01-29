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
  device,
  hardware,
  model,
  project_hardware,
  system,
  system_device,
  workspace,
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
  input: { hardwareId: string | string[] };
}>().create(async (opts) => {
  const ids = Array.isArray(opts.input.hardwareId)
    ? opts.input.hardwareId
    : [opts.input.hardwareId];

  const hardwares = await opts.ctx.db.query.hardware.findMany({
    where: (hardware, { inArray }) => inArray(hardware.id, ids),
    with: {
      workspace: true,
    },
  });

  if (hardwares.length !== ids.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Device not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    hardwares[0]!.workspace.id, // We know that hardwares must have at least 1 element here
  );

  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to all of these devices",
    });
  }

  for (const hardware of _.drop(hardwares, 1)) {
    const user = await checkWorkspaceAccess(opts.ctx, hardware.workspace.id);

    if (
      workspaceUser.userId !== user?.userId ||
      workspaceUser.workspaceId !== user?.workspaceId
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have access to all of these devices",
      });
    }
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      workspaceId: workspaceUser.workspaceId,
      hardwareId: opts.input.hardwareId,
    },
  });
});

const hardwareQueryOptions = z.object({
  workspaceId: z.string(),
  projectId: z.string().optional(),
  modelId: z.string().optional(),
});

const deviceQueryOptions = hardwareQueryOptions.extend({
  onlyAvailable: z.boolean().optional(),
});

type HardwareQueryOptions = z.infer<typeof hardwareQueryOptions>;
type DeviceQueryOptions = z.infer<typeof deviceQueryOptions>;

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
      const model = await db.query.model.findFirst({
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
          .insert(hardware)
          .values(input)
          .returning();

        if (!hardwareCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create device",
          });
        }

        const [deviceCreateResult] = await tx
          .insert(device)
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
          await tx.insert(project_hardware).values({
            projectId: input.projectId,
            hardwareId: hardwareCreateResult.id,
          });
        }

        await tx
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, input.workspaceId));

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
            .from(system_device)
            .where(inArray(system_device.deviceId, input.deviceIds)),
        ),
      );

      const selectResult = await ctx.db
        .select()
        .from(device)
        .innerJoin(hardware, eq(hardware.id, device.id))
        .where(and(inArray(device.id, input.deviceIds), notUsed));

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
          .insert(hardware)
          .values(input)
          .returning();

        if (!hardwareCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create device",
          });
        }

        const [systemCreateResult] = await tx
          .insert(system)
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
          await tx.insert(project_hardware).values({
            projectId: input.projectId,
            hardwareId: hardwareCreateResult.id,
          });
        }

        await tx.insert(system_device).values(
          input.deviceIds.map((deviceId) => ({
            systemId: systemCreateResult.id,
            deviceId,
          })),
        );

        await tx
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, input.workspaceId));

        const model = await tx.query.model.findFirst({
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
      const result = await ctx.db.query.hardware.findFirst({
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
    .input(deviceQueryOptions)
    .use(workspaceAccessMiddleware)
    .output(z.array(selectHardwareSchema))
    .query(async ({ input }) => {
      const devices = await getAllDevices(input);
      const systems = await getAllSystems(input);
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
    .input(deviceQueryOptions)
    .use(workspaceAccessMiddleware)
    .output(z.array(selectDeviceSchema))
    .query(async ({ input }) => {
      return await getAllDevices(input);
    }),

  getAllSystems: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/hardware/all/systems",
        tags: ["hardware"],
      },
    })
    .input(hardwareQueryOptions)
    .use(workspaceAccessMiddleware)
    .output(z.array(selectSystemSchema))
    .query(async ({ input }) => {
      return await getAllSystems(input);
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
      await ctx.db.delete(hardware).where(eq(hardware.id, input.hardwareId));
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
        .update(hardware)
        .set({ name: input.name })
        .where(eq(hardware.id, input.hardwareId));
    }),

  // TODO: Add update remove system components
});

async function getAllDevices(options: DeviceQueryOptions) {
  const { workspaceId, projectId, modelId, onlyAvailable } = options;

  const conditions = [eq(hardware.workspaceId, workspaceId)];
  if (onlyAvailable) {
    const notUsed = not(
      exists(
        db
          .select()
          .from(system_device)
          .where(eq(system_device.deviceId, device.id)),
      ),
    );
    conditions.push(notUsed);
  }

  if (modelId) {
    conditions.push(eq(hardware.modelId, modelId));
  }

  const hardwares = db
    .select({ ...getTableColumns(hardware) })
    .from(hardware)
    .innerJoin(device, eq(hardware.id, device.id))
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
      model: getTableColumns(model),
    })
    .from(temp);

  if (projectId) {
    const projects_hardwares = db
      .select()
      .from(project_hardware)
      .where(eq(project_hardware.projectId, projectId))
      .as("projects_hardwares");

    void query.innerJoin(
      projects_hardwares,
      eq(temp.id, projects_hardwares.hardwareId),
    );
  }
  return await query.innerJoin(model, eq(model.id, temp.modelId));
}

async function getAllSystems(options: HardwareQueryOptions) {
  const { workspaceId, projectId, modelId } = options;

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

  const conditions = [eq(hardware.workspaceId, workspaceId)];

  if (modelId) {
    conditions.push(eq(hardware.modelId, modelId));
  }

  const query = db
    .select({
      type: sql<"system">`'system'`.as("type"),
      id: hardware.id,
      name: hardware.name,
      workspaceId: hardware.workspaceId,
      createdAt: hardware.createdAt,
      updatedAt: hardware.updatedAt,
      modelId: hardware.modelId,
      model: getTableColumns(model),
      // parts: sql<
      //   SystemPart[]
      // >`json_agg(json_build_object('modelId', ${sq.id}, 'name', ${sq.name}))`,
    })
    .from(hardware)
    .innerJoin(system, eq(hardware.id, system.id))
    .where(and(...conditions));

  if (projectId) {
    const projects_hardwares = db
      .select()
      .from(project_hardware)
      .where(eq(project_hardware.projectId, projectId))
      .as("projects_hardwares");

    void query.innerJoin(
      projects_hardwares,
      eq(hardware.id, projects_hardwares.hardwareId),
    );
  }

  const systems = await query.innerJoin(model, eq(model.id, hardware.modelId));
  // .innerJoin(system_device, eq(hardware.id, system_device.systemId))
  // .innerJoin(device, eq(device.id, system_device.deviceId))
  // .innerJoin(sq, eq(sq.id, device.id))
  // .groupBy(hardware.id, model.id);

  return await Promise.all(
    systems.map(async (sys) => {
      const sq = db
        .select()
        .from(system_device)
        .where(eq(system_device.systemId, sys.id))
        .as("sq");

      const parts = await db
        .select({
          id: hardware.id,
          name: hardware.name,
          model: getTableColumns(model),
        })
        .from(hardware)
        .innerJoin(sq, eq(hardware.id, sq.deviceId))
        .innerJoin(model, eq(model.id, hardware.modelId));

      return {
        ...sys,
        parts,
      };
    }),
  );
}
