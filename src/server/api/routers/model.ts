import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { eq } from "drizzle-orm";
import { checkWorkspaceAccess } from "~/lib/auth";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { type db } from "~/server/db";
import { model, workspace } from "~/server/db/schema";
import { workspaceAccessMiddleware } from "./workspace";
import { publicInsertModelSchema, selectModelSchema } from "~/types/model";

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
  createModel: workspaceProcedure
    .meta({
      openapi: { method: "POST", path: "/v1/models/", tags: ["model"] },
    })
    .input(publicInsertModelSchema)
    .output(selectModelSchema)
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
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, input.workspaceId));
        return modelCreateResult;
      });
    }),
});
