import { eq } from "drizzle-orm";
import { z } from "zod";

import _ from "lodash";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { device, project } from "~/server/db/schema";
import { publicInsertDeviceSchema, selectDeviceSchema } from "~/types/device";
import { selectMeasurementSchema } from "~/types/measurement";
import { selectTestSchema } from "~/types/test";
import { type db } from "~/server/db";
import { projectAccessMiddleware } from "./project";

export const deviceAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { deviceId: string };
}>().create(async (opts) => {
  const device = await opts.ctx.db.query.device.findFirst({
    where: (device, { eq }) => eq(device.id, opts.input.deviceId),
    with: {
      project: {
        with: {
          workspace: true,
        },
      },
    },
  });

  if (!device) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Device not found",
    });
  }

  // There are 2 cases:
  // Case 1: Authentication with secret key, in this case workspaceId will be
  // defined in the ctx, thus just need to check if the resource belongs to that
  // workspace, then we will be done.
  if (
    opts.ctx.workspaceId &&
    device.project.workspace.id !== opts.ctx.workspaceId
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this device",
    });
  }

  // Case 2: Authentication with session, in this case we need to check if the
  // has access to the workspace that this resource belongs to
  if (!opts.ctx.workspaceId) {
    const perm = await opts.ctx.db.query.workspace_user.findFirst({
      where: (workspace_user, { and, eq }) =>
        and(
          eq(workspace_user.workspaceId, device.project.workspace.id),
          eq(workspace_user.userId, opts.ctx.userId),
        ),
    });
    if (!perm) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have access to this device",
      });
    }
  }

  return opts.next();
});

export const deviceRouter = createTRPCRouter({
  createDevice: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/devices" },
    })
    .input(publicInsertDeviceSchema)
    .use(projectAccessMiddleware)
    .output(selectDeviceSchema)
    .mutation(async ({ ctx, input }) => {
      const [deviceCreateResult] = await ctx.db
        .insert(device)
        .values(input)
        .returning();

      if (!deviceCreateResult) {
        throw new Error("Failed to create device");
      }

      await ctx.db
        .update(project)
        .set({ updatedAt: new Date() })
        .where(eq(project.id, input.projectId));

      return deviceCreateResult;
    }),

  _createDevices: workspaceProcedure
    .input(z.array(publicInsertDeviceSchema))
    .output(z.array(selectDeviceSchema))
    .mutation(async ({ ctx, input }) => {
      const devicesCreateResult = await ctx.db
        .insert(device)
        .values([...input])
        .returning();

      if (!devicesCreateResult) {
        throw new Error("Failed to create devices");
      }

      await Promise.all(
        _.uniq(input.map((device) => device.projectId)).map(
          async (projectId) => {
            await ctx.db
              .update(project)
              .set({ updatedAt: new Date() })
              .where(eq(project.id, projectId));
          },
        ),
      );

      return devicesCreateResult;
    }),

  getDeviceById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/devices/{deviceId}",
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
        throw new Error("Failed to find device");
      }

      return result;
    }),

  getAllDevicesByProjectId: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/devices" },
    })
    .input(z.object({ projectId: z.string() }))
    .use(projectAccessMiddleware)
    .output(z.array(selectDeviceSchema))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.device.findMany({
        where: (device, { eq }) => eq(device.projectId, input.projectId),
      });
    }),

  deleteDeviceById: workspaceProcedure
    .meta({
      openapi: { method: "DELETE", path: "/v1/devices/{deviceId}" },
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
        throw new Error("Failed to delete device");
      }

      return deleted;
    }),
});
