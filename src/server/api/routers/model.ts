import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { z } from "zod";
import { checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspaceAccessMiddleware } from "./workspace";
import { getModelById, markUpdatedAt } from "~/lib/query";
import { insertModelSchema, selectModelTreeSchema } from "~/types/model";
import { model } from "~/schemas/public/Model";

export const modelAccessMiddlware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { modelId: string };
}>().create(async (opts) => {
  const model = await getModelById(opts.input.modelId);

  if (!model) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Model not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(opts.ctx, model.workspaceId);

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
  createModel: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/models/devices", tags: ["model"] },
    })
    .input(insertModelSchema)
    .output(model)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction().execute(async (tx) => {
        const { components, ...newModel } = input;
        const model = await tx
          .insertInto("model")
          .values(newModel)
          .returningAll()
          .executeTakeFirstOrThrow(
            () =>
              new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to create model",
              }),
          );

        await markUpdatedAt(tx, "workspace", input.workspaceId);

        return model;
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
    .output(z.array(model))
    .use(workspaceAccessMiddleware)
    .query(async ({ input, ctx }) => {
      const models = await ctx.db
        .selectFrom("model")
        .selectAll("model")
        .where("model.workspaceId", "=", input.workspaceId)
        .execute();

      return models;
    }),

  getModelById: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/models/{modelId}", tags: ["model"] },
    })
    .input(
      z.object({
        modelId: z.string(),
      }),
    )
    .output(selectModelTreeSchema)
    .use(modelAccessMiddlware)
    .query(async ({ input, ctx }) => {
      // TODO:
      throw new Error("Not implemented");
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
      await ctx.db
        .deleteFrom("model")
        .where("model.id", "=", input.modelId)
        .execute();
    }),
});
