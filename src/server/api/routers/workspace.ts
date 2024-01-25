import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  workspace,
  user,
  workspace_user,
  project,
  hardware,
  systemModel,
  model,
} from "~/server/db/schema";
import {
  publicInsertWorkspaceSchema,
  selectWorkspaceSchema,
} from "~/types/workspace";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { cookies } from "next/headers";
import { selectWorkspaceUserSchema } from "~/types/workspace_user";
import { api } from "~/trpc/server";

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
      const newWorkspace = await ctx.db.transaction(async (tx) => {
        const [newWorkspace] = await tx
          .insert(workspace)
          .values({ planType: "enterprise", ...input })
          .returning();

        if (!newWorkspace) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace",
          });
        }

        await tx.insert(workspace_user).values({
          workspaceId: newWorkspace.id,
          userId: ctx.session.user.userId,
          workspaceRole: "owner",
        });

        cookies().set("scope", newWorkspace.namespace);

        if (!input.populateData) {
          return newWorkspace;
        }

        return newWorkspace;
      });

      await api.example.populateExample.mutate({
        workspaceId: newWorkspace.id,
      });

      return newWorkspace;
    }),

  updateWorkspace: workspaceProcedure
    .input(
      publicInsertWorkspaceSchema.merge(z.object({ workspaceId: z.string() })),
    )
    .output(selectWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workspaceId, ...updatedWorkspace } = input;
      const [result] = await ctx.db
        .update(workspace)
        .set(updatedWorkspace)
        .where(eq(workspace.id, ctx.workspaceId))
        .returning();
      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workspace",
        });
      }

      return result;
    }),

  deleteWorkspaceById: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        await tx
          .delete(project)
          .where(eq(project.workspaceId, input.workspaceId));

        await tx.execute(
          sql`DELETE FROM cloud_system AS cs USING cloud_hardware as ch WHERE ch.workspace_id = ${input.workspaceId} AND cs.id = ch.id`,
        );

        await tx
          .delete(hardware)
          .where(eq(hardware.workspaceId, input.workspaceId));

        await tx.execute(
          sql`DELETE FROM cloud_model AS cm USING cloud_system_model as csm WHERE cm.workspace_id = ${input.workspaceId} AND cm.id = csm.id`,
        );

        await tx.delete(workspace).where(eq(workspace.id, input.workspaceId));
      });
    }),

  getWorkspaces: protectedProcedure
    .input(z.void())
    .output(
      z.array(
        selectWorkspaceSchema.merge(
          selectWorkspaceUserSchema.pick({ workspaceRole: true }),
        ),
      ),
    )
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .select({
          workspace: workspace,
          workspaceUser: workspace_user,
        })
        .from(workspace_user)
        .innerJoin(workspace, eq(workspace_user.workspaceId, workspace.id))
        .innerJoin(user, eq(workspace_user.userId, user.id))
        .where(eq(user.id, ctx.session.user.userId));

      return result.map((w) => ({
        ...w.workspace,
        workspaceRole: w.workspaceUser.workspaceRole,
      }));
    }),

  getWorkspaceById: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
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

  getWorkspaceIdByNamespace: protectedProcedure
    .input(z.object({ namespace: z.string() }))
    .output(z.string())
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.workspace.findFirst({
        where: (workspace, { eq }) => eq(workspace.namespace, input.namespace),
      });
      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workspace not found",
        });
      }
      return result.id;
    }),
});
