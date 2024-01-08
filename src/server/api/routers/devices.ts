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
import { checkWorkspaceAccess } from "~/lib/auth";

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

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    device.project.workspace.id,
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
    .use(projectAccessMiddleware)
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
          .update(project)
          .set({ updatedAt: new Date() })
          .where(eq(project.id, input.projectId));

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
        const devicesCreateResult = await tx
          .insert(device)
          .values([...input])
          .returning();

        if (!devicesCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create devices",
          });
        }

        await Promise.all(
          _.uniq(input.map((device) => device.projectId)).map(
            async (projectId) => {
              await tx
                .update(project)
                .set({ updatedAt: new Date() })
                .where(eq(project.id, projectId));
            },
          ),
        );

        return devicesCreateResult;
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

  getAllDevicesByProjectId: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/devices", tags: ["device"] },
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
