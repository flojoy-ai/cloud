import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { checkWorkspaceAccess } from "~/lib/auth";
import { partsFrom } from "~/lib/query";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  deviceModel,
  model,
  systemModel,
  systemModelDeviceModel,
  workspace,
} from "~/server/db/schema";
import {
  publicInsertDeviceModelSchema,
  publicInsertSystemModelSchema,
  selectDeviceModelSchema,
  selectModelSchema,
  selectSystemModelSchema,
} from "~/types/model";
import { workspaceAccessMiddleware } from "./workspace";

export const modelAccessMiddlware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { modelId: string };
}>().create(async (opts) => {
  const model = await opts.ctx.db.query.model.findFirst({
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
      workspaceId: workspaceUser.workspaceId,
      modelId: model.id,
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
          .insert(model)
          .values(input)
          .returning();

        if (!modelCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create model",
          });
        }

        await tx
          .insert(deviceModel)
          .values({ id: modelCreateResult.id })
          .returning();

        await tx
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, input.workspaceId));

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
        .from(deviceModel)
        .innerJoin(model, eq(model.id, deviceModel.id))
        .where(
          and(
            eq(model.workspaceId, input.workspaceId),
            inArray(model.id, partIds),
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
          .insert(model)
          .values(input)
          .returning();

        if (!modelCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create model",
          });
        }

        await tx
          .insert(systemModel)
          .values({ id: modelCreateResult.id })
          .returning();

        await tx.insert(systemModelDeviceModel).values(
          input.parts.map(({ modelId, count }) => ({
            systemModelId: modelCreateResult.id,
            deviceModelId: modelId,
            count,
          })),
        );

        await tx
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, input.workspaceId));

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
      await ctx.db.delete(model).where(eq(model.id, input.modelId));
    }),
});

async function getDeviceModels(workspaceId: string) {
  return await db
    .select({
      type: sql<"device">`'device'`.as("type"),
      ...getTableColumns(model),
    })
    .from(model)
    .innerJoin(deviceModel, eq(deviceModel.id, model.id))
    .where(eq(model.workspaceId, workspaceId));
}

async function getSystemModels(workspaceId: string) {
  const sq = db
    .select({ id: model.id, name: model.name })
    .from(model)
    .innerJoin(deviceModel, eq(deviceModel.id, model.id))
    .where(eq(model.workspaceId, workspaceId))
    .as("sq");

  return await db
    .select({
      ...getTableColumns(model),
      type: sql<"system">`'system'`.as("type"),
      parts: partsFrom(deviceModel.id, sq.name, systemModelDeviceModel.count),
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
    .leftJoin(sq, eq(sq.id, deviceModel.id))
    .groupBy(model.id)
    .where(eq(model.workspaceId, workspaceId));
}
