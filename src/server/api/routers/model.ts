import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { and, eq, getTableColumns, inArray } from "drizzle-orm";
import { z } from "zod";
import { checkWorkspaceAccess } from "~/lib/auth";
import { partsFrom } from "~/lib/query";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
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
      message: "You do not have access to this measurement",
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
      openapi: { method: "POST", path: "/v1/models/device", tags: ["model"] },
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
      openapi: { method: "POST", path: "/v1/models/system", tags: ["model"] },
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
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.model.findMany({
        where: () => eq(model.workspaceId, input.workspaceId),
      });
    }),

  getAllDeviceModels: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/models/device", tags: ["model"] },
    })
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .output(z.array(selectDeviceModelSchema))
    .use(workspaceAccessMiddleware)
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          ...getTableColumns(model),
        })
        .from(model)
        .innerJoin(deviceModel, eq(deviceModel.id, model.id))
        .where(eq(model.workspaceId, input.workspaceId));
    }),

  getAllSystemModels: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/models/system", tags: ["model"] },
    })
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .output(z.array(selectSystemModelSchema))
    .use(workspaceAccessMiddleware)
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select({
          ...getTableColumns(model),
          parts: partsFrom(
            deviceModel.id,
            model.name,
            systemModelDeviceModel.count,
          ),
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
        .where(eq(model.workspaceId, input.workspaceId));
    }),
});
