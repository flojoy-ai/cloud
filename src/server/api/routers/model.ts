import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { z } from "zod";
import { checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspaceAccessMiddleware } from "./workspace";
import { type DatabaseError } from "pg";
import { getModelById, getModelTree, markUpdatedAt } from "~/lib/query";
import { insertModelSchema, modelTreeSchema } from "~/types/model";
import { model } from "~/schemas/public/Model";
import { generateDatabaseId } from "~/lib/id";

export const modelAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
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
        try {
          const { components, ...newModel } = input;
          const model = await tx
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
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          const err = error as DatabaseError;
          if (err.code === "23505") {
            throw new TRPCError({
              code: "CONFLICT",
              message: `A model with identifier "${input.name}" already exists!`,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
            message: "Internal server error",
          });
        }
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

  getModelById: workspaceProcedure
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
      try {
        await ctx.db.transaction().execute(async (tx) => {
          await tx
            .deleteFrom("model")
            .where("model.id", "=", input.modelId)
            .execute();

          await markUpdatedAt(tx, "workspace", ctx.workspaceId);
        });
      } catch (e) {
        const err = e as DatabaseError;
        if (err.code === "23503") {
          throw new TRPCError({
            message:
              "Cannot delete model because some of its resources are in use, make sure all associated items are deleted first",
            cause: e,
            code: "BAD_REQUEST",
          });
        }

        throw new TRPCError({
          message: "Internal database error",
          cause: e,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
