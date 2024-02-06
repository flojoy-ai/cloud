import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { z } from "zod";
import { checkWorkspaceAccess } from "~/lib/auth";
// import { partsFrom } from "~/lib/query";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  publicInsertDeviceModelSchema,
  publicInsertSystemModelSchema,
  selectDeviceModelSchema,
  selectModelSchema,
  selectSystemModelSchema,
} from "~/types/model";
import { workspaceAccessMiddleware } from "./workspace";

export const modelAccessMiddlware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { modelId: string };
}>().create(async (opts) => {
  const model = await opts.ctx.db.query.modelTable.findFirst({
    where: (model, { eq }) => eq(model.id, opts.input.modelId),
    with: {
      workspace: true,
    },
  });

  if (!model) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Model not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    model.workspace.id,
  );
  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this model",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      workspaceUser,
      model,
    },
  });
});

export const modelRouter = createTRPCRouter({
  createDeviceModel: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/models/devices", tags: ["model"] },
    })
    .input(publicInsertDeviceModelSchema)
    .output(selectDeviceModelSchema)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [modelCreateResult] = await tx
          .insert(modelTable)
          .values(input)
          .returning();

        if (!modelCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create model",
          });
        }

        await tx
          .insert(deviceModelTable)
          .values({ id: modelCreateResult.id })
          .returning();

        await tx
          .update(workspaceTable)
          .set({ updatedAt: new Date() })
          .where(eq(workspaceTable.id, input.workspaceId));

        return modelCreateResult;
      });
    }),

  createSystemModel: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/models/systems", tags: ["model"] },
    })
    .input(publicInsertSystemModelSchema)
    .output(selectSystemModelSchema)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      const partIds = input.parts.map((p) => p.modelId);

      const res = await ctx.db
        .select()
        .from(deviceModelTable)
        .innerJoin(modelTable, eq(modelTable.id, deviceModelTable.id))
        .where(
          and(
            eq(modelTable.workspaceId, input.workspaceId),
            inArray(modelTable.id, partIds),
          ),
        );

      const deviceModels = Object.fromEntries(
        res.map(({ model }) => [model.id, model]),
      );

      if (partIds.some((id) => deviceModels[id] === undefined)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "All system parts must be valid device models",
        });
      }

      return await ctx.db.transaction(async (tx) => {
        const [modelCreateResult] = await tx
          .insert(modelTable)
          .values(input)
          .returning();

        if (!modelCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create model",
          });
        }

        await tx
          .insert(systemModelTable)
          .values({ id: modelCreateResult.id })
          .returning();

        await tx.insert(systemModelDeviceModelTable).values(
          input.parts.map(({ modelId, count }) => ({
            systemModelId: modelCreateResult.id,
            deviceModelId: modelId,
            count,
          })),
        );

        await tx
          .update(workspaceTable)
          .set({ updatedAt: new Date() })
          .where(eq(workspaceTable.id, input.workspaceId));

        return {
          ...modelCreateResult,
          parts: input.parts.map((part) => ({
            ...part,
            name: deviceModels[part.modelId]!.name,
          })),
        };
      });
    }),

  getAllModels: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/models/", tags: ["model"] },
    })
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .output(z.array(selectModelSchema))
    .use(workspaceAccessMiddleware)
    .query(async ({ input }) => {
      const deviceModels = await getDeviceModels(input.workspaceId);
      const systemModels = await getSystemModels(input.workspaceId);

      return [...deviceModels, ...systemModels];
    }),

  getAllDeviceModels: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/models/devices", tags: ["model"] },
    })
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .output(z.array(selectDeviceModelSchema))
    .use(workspaceAccessMiddleware)
    .query(async ({ input }) => {
      return await getDeviceModels(input.workspaceId);
    }),

  getAllSystemModels: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/models/systems", tags: ["model"] },
    })
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .output(z.array(selectSystemModelSchema))
    .use(workspaceAccessMiddleware)
    .query(async ({ input }) => {
      return await getSystemModels(input.workspaceId);
    }),

  deleteModel: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/models/{modelId}",
        tags: ["model"],
      },
    })
    .input(
      z.object({
        modelId: z.string(),
      }),
    )
    .output(z.void())
    .use(modelAccessMiddlware)
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }
      await ctx.db.delete(modelTable).where(eq(modelTable.id, input.modelId));
    }),
});

async function getDeviceModels(workspaceId: string) {
  return await db
    .select({
      type: sql<"device">`'device'`.as("type"),
      ...getTableColumns(modelTable),
    })
    .from(modelTable)
    .innerJoin(deviceModelTable, eq(deviceModelTable.id, modelTable.id))
    .where(eq(modelTable.workspaceId, workspaceId));
}

async function getSystemModels(workspaceId: string) {
  const sq = db
    .select({ id: modelTable.id, name: modelTable.name })
    .from(modelTable)
    .innerJoin(deviceModelTable, eq(deviceModelTable.id, modelTable.id))
    .where(eq(modelTable.workspaceId, workspaceId))
    .as("sq");

  return await db
    .select({
      ...getTableColumns(modelTable),
      type: sql<"system">`'system'`.as("type"),
      parts: partsFrom(
        deviceModelTable.id,
        sq.name,
        systemModelDeviceModelTable.count,
      ),
    })
    .from(modelTable)
    .innerJoin(systemModelTable, eq(systemModelTable.id, modelTable.id))
    .innerJoin(
      systemModelDeviceModelTable,
      eq(systemModelTable.id, systemModelDeviceModelTable.systemModelId),
    )
    .innerJoin(
      deviceModelTable,
      eq(deviceModelTable.id, systemModelDeviceModelTable.deviceModelId),
    )
    .leftJoin(sq, eq(sq.id, deviceModelTable.id))
    .groupBy(modelTable.id)
    .where(eq(modelTable.workspaceId, workspaceId));
}
