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

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import {
  device,
  deviceModel,
  hardware,
  model,
  project_hardware,
  system,
  systemModel,
  systemModelDeviceModel,
  system_device,
  workspace,
} from "~/server/db/schema";
import {
  publicInsertDeviceSchema,
  publicInsertSystemSchema,
  selectHardwareSchema,
} from "~/types/hardware";
import { selectMeasurementSchema } from "~/types/measurement";
import { selectTestSchema } from "~/types/test";
import { db } from "~/server/db";
import { checkWorkspaceAccess } from "~/lib/auth";
import { workspaceAccessMiddleware } from "./workspace";
import _ from "lodash";
import { type systemPartsSchema } from "~/types/model";

export const hardwareAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { hardwareId: string };
}>().create(async (opts) => {
  const hardware = await opts.ctx.db.query.hardware.findFirst({
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
        path: "/v1/hardware/device",
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

        await tx
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, input.workspaceId));

        return hardwareCreateResult;
      });
    }),

  createSystem: workspaceProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/v1/hardware/system",
        tags: ["hardware", "system"],
      },
    })
    .input(publicInsertSystemSchema)
    .use(workspaceAccessMiddleware)
    .output(selectHardwareSchema)
    .mutation(async ({ ctx, input }) => {
      // TODO: Refactor this massive query
      const [deviceParts] = await ctx.db
        .select({
          parts: sql<
            z.infer<typeof systemPartsSchema>
          >`json_agg(json_build_object('modelId', ${deviceModel.id}, 'count', ${systemModelDeviceModel.count}))`,
        })
        .from(model)
        .innerJoin(systemModel, eq(systemModel.id, model.id))
        .innerJoin(
          systemModelDeviceModel,
          eq(systemModel.id, systemModelDeviceModel.systemModelId),
        )
        .innerJoin(
          deviceModel,
          eq(deviceModel.id, systemModelDeviceModel.deviceModelId),
        )
        .groupBy(systemModel.id)
        .where(eq(model.id, input.modelId));

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

      const matchesModel = deviceParts.parts.every(
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

        return hardwareCreateResult;
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
      selectHardwareSchema.merge(
        z.object({
          measurements: z.array(
            selectMeasurementSchema.merge(
              z.object({
                test: selectTestSchema,
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
              hardware: true,
            },
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Device not found",
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
        type: z.enum(["device", "system"]).optional(),
        onlyAvailable: z.boolean().optional(),
      }),
    )
    .use(workspaceAccessMiddleware)
    .output(z.array(selectHardwareSchema))
    .query(async ({ input, ctx }) => {
      let hardwares;

      switch (input.type) {
        case "device":
          const conditions = [eq(hardware.workspaceId, input.workspaceId)];
          if (input.onlyAvailable) {
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

          hardwares = ctx.db
            .select({ ...getTableColumns(hardware) })
            .from(hardware)
            .innerJoin(device, eq(hardware.id, device.id))
            .where(and(...conditions));
          break;
        case "system":
          hardwares = ctx.db
            .select({ ...getTableColumns(hardware) })
            .from(hardware)
            .innerJoin(system, eq(hardware.id, system.id))
            .where(eq(hardware.workspaceId, input.workspaceId));
          break;
        default:
          hardwares = ctx.db
            .select()
            .from(hardware)
            .where(eq(hardware.workspaceId, input.workspaceId));
          break;
      }

      if (!input.projectId) {
        return await hardwares;
      }

      const projects_hardwares = ctx.db
        .select()
        .from(project_hardware)
        .where(eq(project_hardware.projectId, input.projectId))
        .as("projects_hardwares");

      const temp = hardwares.as("hardwares");

      return await ctx.db
        .select({
          name: temp.name,
          workspaceId: temp.workspaceId,
          createdAt: temp.createdAt,
          updatedAt: temp.updatedAt,
          modelId: temp.modelId,
          id: temp.id,
        })
        .from(temp)
        .innerJoin(
          projects_hardwares,
          eq(temp.id, projects_hardwares.hardwareId),
        );
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
    .output(selectHardwareSchema)
    .query(async ({ input, ctx }) => {
      const [deleted] = await ctx.db
        .delete(hardware)
        .where(eq(hardware.id, input.hardwareId))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete hardware",
        });
      }

      return deleted;
    }),
});
