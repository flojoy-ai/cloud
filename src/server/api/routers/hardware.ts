import { z } from "zod";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import _ from "lodash";
import { checkWorkspaceAccess } from "~/lib/auth";
// import { getSystemModelParts } from "~/lib/query";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspaceAccessMiddleware } from "./workspace";
import {
  getHardwareById,
  getHardwareTree,
  getModelById,
  markUpdatedAt,
} from "~/lib/query";
import {
  insertHardwareSchema,
  selectHardwareSchema,
  updateHardwareSchema,
} from "~/types/hardware";
import { generateDatabaseId } from "~/lib/id";
import { hardware } from "~/schemas/public/Hardware";

export const hardwareAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { hardwareId: string };
}>().create(async (opts) => {
  const hardware = await getHardwareById(opts.input.hardwareId);

  if (!hardware) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Device not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    hardware.workspaceId,
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
    ctx: { workspaceUser, hardware },
  });
});

export const multiHardwareAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { hardwareIds: string[] };
}>().create(async (opts) => {
  const ids = opts.input.hardwareIds;

  if (ids.length === 0) {
    return opts.next({
      ctx: {
        workspaceId: opts.ctx.workspaceId,
        hardwareIds: ids,
      },
    });
  }

  const hardwares = await opts.ctx.db
    .selectFrom("hardware")
    .selectAll()
    .where("id", "in", ids)
    .execute();

  if (hardwares.length !== ids.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Device not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    hardwares[0]!.workspaceId, // We know that hardwares must have at least 1 element here
  );

  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to all of these devices",
    });
  }

  for (const hardware of _.drop(hardwares, 1)) {
    const user = await checkWorkspaceAccess(opts.ctx, hardware.workspaceId);

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
      workspaceUser,
      hardwares,
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
  createHardware: workspaceProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/v1/hardwares/",
        tags: ["hardwares"],
      },
    })
    .input(insertHardwareSchema)
    .use(workspaceAccessMiddleware)
    .output(hardware)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction().execute(async (tx) => {
        const { components, ...newHardware } = input;
        const hardware = await tx
          .insertInto("hardware")
          .values({
            id: generateDatabaseId("hardware"),
            ...newHardware,
          })
          .returningAll()
          .executeTakeFirstOrThrow(
            () =>
              new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create model",
              }),
          );

        if (components.length > 0) {
          await tx
            .insertInto("hardware_relation")
            .values(
              components.map((c) => ({
                parentHardwareId: hardware.id,
                childHardwareId: c.hardwareId,
              })),
            )
            .execute();
        }

        await markUpdatedAt(tx, "workspace", input.workspaceId);

        return hardware;
      });
    }),

  getHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/hardwares/{hardwareId}",
        tags: ["hardwares"],
      },
    })
    .input(z.object({ hardwareId: z.string() }))
    .use(hardwareAccessMiddleware)
    .output(selectHardwareSchema)
    .query(async ({ ctx }) => {
      return await getHardwareTree(ctx.hardware);
    }),

  getAllHardware: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/hardwares", tags: ["hardwares"] },
    })
    .input(deviceQueryOptions)
    .use(workspaceAccessMiddleware)
    .output(z.array(hardware))
    .query(async ({ input, ctx }) => {
      const hardwares = await ctx.db
        .selectFrom("hardware")
        .selectAll()
        .where("hardware.workspaceId", "=", input.workspaceId)
        .execute();

      return hardwares;
    }),

  deleteHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/hardwares/{hardwareId}",
        tags: ["hardwares"],
      },
    })
    .input(z.object({ hardwareId: z.string() }))
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      await ctx.db
        .deleteFrom("hardware")
        .where("id", "=", input.hardwareId)
        .execute();
    }),

  updateHardwareById: workspaceProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/v1/hardwares/{hardwareId}",
        tags: ["hardwares"],
      },
    })
    .input(updateHardwareSchema)
    .use(hardwareAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.transaction().execute(async (tx) => {
        await tx
          .updateTable("hardware")
          .set(input)
          .where("id", "=", input.hardwareId)
          .execute();

        await markUpdatedAt(tx, "hardware", input.hardwareId);
      });
    }),

  // TODO: Add update remove system components
});
