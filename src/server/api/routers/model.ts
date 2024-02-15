import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { z } from "zod";
import { type AccessContext, checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { workspaceAccessMiddleware } from "./workspace";
import { type DatabaseError } from "pg";
import { getModelById, getModelTree, markUpdatedAt } from "~/lib/query";
import { insertModelSchema, modelTreeSchema } from "~/types/model";
import { model } from "~/schemas/public/Model";
import { generateDatabaseId } from "~/lib/id";
import { withDBErrorCheck } from "~/lib/db-utils";

export const modelAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: AccessContext;
  input: { modelId: string };
}>().create(async (opts) => {
  const model = await getModelById(opts.input.modelId);

  if (!model) {
    throw new TRPCError({
      code: "NOT_FOUND",
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
      openapi: { method: "POST", path: "/v1/models/", tags: ["models"] },
    })
    .input(insertModelSchema)
    .output(model)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction().execute(async (tx) => {
        const { components, ...newModel } = input;
        const model = await withDBErrorCheck(
          tx
            .insertInto("model")
            .values({
              id: generateDatabaseId("model"),
              ...newModel,
            })
            .returningAll()
            .executeTakeFirstOrThrow(
              () =>
                new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to create model",
                }),
            ),
          {
            errorCode: "DUPLICATE",
            errorMsg: `A model with identifier "${input.name}" already exists!`,
          },
        );

        if (components.length > 0) {
          await tx
            .insertInto("model_relation")
            .values(
              components.map((c) => ({
                parentModelId: model.id,
                childModelId: c.modelId,
                count: c.count,
              })),
            )
            .execute();
        }

        await markUpdatedAt(tx, "workspace", input.workspaceId);

        return model;
      });
    }),

  getAllModels: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/models/", tags: ["models"] },
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

  getModel: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/models/{modelId}",
        tags: ["models"],
      },
    })
    .input(
      z.object({
        modelId: z.string(),
      }),
    )
    .output(modelTreeSchema)
    .use(modelAccessMiddleware)
    .query(async ({ ctx }) => {
      return await getModelTree(ctx.model);
    }),

  deleteModel: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/models/{modelId}",
        tags: ["models"],
      },
    })
    .input(
      z.object({
        modelId: z.string(),
      }),
    )
    .output(z.void())
    .use(modelAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      await ctx.db.transaction().execute(async (tx) => {
        await withDBErrorCheck(
          tx
            .deleteFrom("model")
            .where("model.id", "=", input.modelId)
            .execute(),
          {
            errorCode: "FOREIGN_KEY_VIOLATION",
            errorMsg:
              "Cannot delete model because some of its resources are in use, make sure all associated items are deleted first",
          },
        );

        await markUpdatedAt(tx, "workspace", ctx.workspaceId);
      });
    }),
});
