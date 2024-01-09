import { type SQL, eq } from "drizzle-orm";
import { z } from "zod";

import _ from "lodash";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { device, project, project_device, workspace } from "~/server/db/schema";
import { publicInsertDeviceSchema, selectDeviceSchema } from "~/types/device";
import { selectMeasurementSchema } from "~/types/measurement";
import { selectTestSchema } from "~/types/test";
import { type db } from "~/server/db";
import { projectAccessMiddleware } from "./project";
import { checkWorkspaceAccess } from "~/lib/auth";
import { workspaceAccessMiddleware } from "./workspace";

export const deviceAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { deviceId: string };
}>().create(async (opts) => {
  const device = await opts.ctx.db.query.device.findFirst({
    where: (device, { eq }) => eq(device.id, opts.input.deviceId),
    with: {
      workspace: true,
    },
  });

  if (!device) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Device not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    device.workspace.id,
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
    ctx: { workspaceId: workspaceUser.workspaceId, deviceId: device.id },
  });
});

export const deviceRouter = createTRPCRouter({
  createDevice: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/devices", tags: ["device"] },
    })
    .input(publicInsertDeviceSchema)
    .use(workspaceAccessMiddleware)
    .output(selectDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [deviceCreateResult] = await tx
          .insert(device)
          .values(input)
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

        return deviceCreateResult;
      });
    }),

  // TODO: Remove this, this is just for testing
  // Since the input is an array it is not possible (nasty) to use the
  // middleware to handle permission check.
  _createDevices: workspaceProcedure
    .input(z.array(publicInsertDeviceSchema))
    .output(z.array(selectDeviceSchema))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const devices = await tx
          .insert(device)
          .values([...input])
          .returning();

        if (!devices) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create devices",
          });
        }

        await Promise.all(
          _.uniq(input.map((device) => device.workspaceId)).map(
            async (workspaceId) => {
              await tx
                .update(workspace)
                .set({ updatedAt: new Date() })
                .where(eq(workspace.id, workspaceId));
            },
          ),
        );

        return devices;
      });
    }),

  getDeviceById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/devices/{deviceId}",
        tags: ["device"],
      },
    })
    .input(z.object({ deviceId: z.string() }))
    .use(deviceAccessMiddleware)
    .output(
      selectDeviceSchema.merge(
        z.object({
          measurements: z.array(
            selectMeasurementSchema.merge(
              z.object({ test: selectTestSchema, device: selectDeviceSchema }),
            ),
          ),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.device.findFirst({
        where: (device, { eq }) => eq(device.id, input.deviceId),
        with: {
          measurements: {
            with: {
              test: true,
              device: true,
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

  getAllDevices: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/devices", tags: ["device"] },
    })
    .input(
      z.object({ workspaceId: z.string(), projectId: z.string().optional() }),
    )
    .use(workspaceAccessMiddleware)
    .output(z.array(selectDeviceSchema))
    .query(async ({ input, ctx }) => {
      const devices = ctx.db
        .select()
        .from(device)
        .where(eq(device.workspaceId, input.workspaceId));

      if (input.projectId) {
        const projects_devices = ctx.db
          .select()
          .from(project_device)
          .where(eq(project_device.projectId, input.projectId))
          .as("projects_devices");

        const temp = devices.as("devices");

        return await ctx.db
          .select({
            name: temp.name,
            workspaceId: temp.workspaceId,
            createdAt: temp.createdAt,
            updatedAt: temp.updatedAt,
            id: temp.id,
          })
          .from(temp)
          .innerJoin(projects_devices, eq(temp.id, projects_devices.deviceId));
      } else {
        return await devices;
      }
    }),

  deleteDeviceById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/devices/{deviceId}",
        tags: ["device"],
      },
    })
    .input(z.object({ deviceId: z.string() }))
    .use(deviceAccessMiddleware)
    .output(selectDeviceSchema)
    .query(async ({ input, ctx }) => {
      const [deleted] = await ctx.db
        .delete(device)
        .where(eq(device.id, input.deviceId))
        .returning();

      if (!deleted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete device",
        });
      }

      return deleted;
    }),
});
