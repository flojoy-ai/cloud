import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import { workspace, workspace_user } from "~/server/db/schema";
import {
  publicInsertWorkspaceSchema,
  selectWorkspaceSchema,
} from "~/types/workspace";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";

export const workspaceAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { workspaceId: string };
}>().create(async (opts) => {
  const workspace = await opts.ctx.db.query.workspace.findFirst({
    where: (workspace, { eq }) => eq(workspace.id, opts.input.workspaceId),
  });

  if (!workspace) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Workspace not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    opts.input.workspaceId,
  );
  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this workspace",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      workspaceId: workspaceUser.workspaceId,
    },
  });
});

export const workspaceRouter = createTRPCRouter({
  createWorkspace: protectedProcedure
    .input(publicInsertWorkspaceSchema)
    .output(selectWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [workspaceCreateResult] = await tx
          .insert(workspace)
          .values({
            ...input,
            planType: "hobby",
          })
          .returning();

        if (!workspaceCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace",
          });
        }

        await tx.insert(workspace_user).values({
          userId: ctx.session.user.userId,
          workspaceId: workspaceCreateResult.id,
          workspaceRole: "owner",
        });
        return workspaceCreateResult;
      });
    }),

  updateWorkspace: workspaceProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/v1/workspaces/{workspaceId}",
        tags: ["workspace"],
      },
    })
    .input(
      publicInsertWorkspaceSchema.merge(z.object({ workspaceId: z.string() })),
    )
    .output(z.void())
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workspaceId, ...updatedWorkspace } = input;
      await ctx.db
        .update(workspace)
        .set(updatedWorkspace)
        .where(eq(workspace.id, ctx.workspaceId));
    }),

  deleteWorkspaceById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/workspaces/{workspaceId}",
        tags: ["workspace"],
      },
    })
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(workspace).where(eq(workspace.id, input.workspaceId));
    }),

  getAllWorkspaces: protectedProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/workspaces/", tags: ["workspace"] },
    })
    .input(z.void())
    .output(z.array(selectWorkspaceSchema))
    .query(async ({ ctx }) => {
      const workspaceIds = (
        await db.query.workspace_user.findMany({
          where: (workspace_user, { eq }) =>
            eq(workspace_user.userId, ctx.session.user.userId),
          columns: {
            workspaceId: true,
          },
        })
      ).map((workspace) => workspace.workspaceId);

      if (workspaceIds.length === 0) {
        return [];
      }

      return await db.query.workspace.findMany({
        where: (workspace, { inArray }) => inArray(workspace.id, workspaceIds),
      });
    }),

  getWorkspaceById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/workspaces/{workspaceId}",
        tags: ["workspace"],
      },
    })
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(selectWorkspaceSchema)
    .query(async ({ input }) => {
      const result = await db.query.workspace.findFirst({
        where: (workspace, { eq }) => eq(workspace.id, input.workspaceId),
      });

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workspace not found",
        });
      }
      return result;
    }),
});
