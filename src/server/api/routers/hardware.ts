import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { hardware, project_hardware, workspace } from "~/server/db/schema";
import {
  publicInsertHardwareSchema,
  selectHardwareSchema,
} from "~/types/hardware";
import { selectMeasurementSchema } from "~/types/measurement";
import { selectTestSchema } from "~/types/test";
import { type db } from "~/server/db";
import { checkWorkspaceAccess } from "~/lib/auth";
import { workspaceAccessMiddleware } from "./workspace";

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
  createHardware: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/devices", tags: ["device"] },
    })
    .input(publicInsertHardwareSchema)
    .use(workspaceAccessMiddleware)
    .output(selectHardwareSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [deviceCreateResult] = await tx
          .insert(hardware)
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

  getHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/devices/{deviceId}",
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
      openapi: { method: "GET", path: "/v1/hardwares", tags: ["hardware"] },
    })
    .input(
      z.object({ workspaceId: z.string(), projectId: z.string().optional() }),
    )
    .use(workspaceAccessMiddleware)
    .output(z.array(selectHardwareSchema))
    .query(async ({ input, ctx }) => {
      const hardwares = ctx.db
        .select()
        .from(hardware)
        .where(eq(hardware.workspaceId, input.workspaceId));

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
        path: "/v1/hardwares/{hardwareId}",
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
