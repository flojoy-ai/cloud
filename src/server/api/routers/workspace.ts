import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  workspaceTable,
  userTable,
  workspaceUserTable,
  projectTable,
  hardwareTable,
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
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { workspaceId: string };
}>().create(async (opts) => {
  const workspace = await opts.ctx.db.query.workspaceTable.findFirst({
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
      workspace,
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
          .insert(workspaceTable)
          .values({ planType: "enterprise", ...input })
          .returning();

        if (!newWorkspace) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace",
          });
        }

        await tx.insert(workspaceUserTable).values({
          workspaceId: newWorkspace.id,
          userId: ctx.user.id,
          role: "owner" as const,
          isPending: false,
        });

        cookies().set("scope", newWorkspace.namespace);

        return newWorkspace;
      });

      if (!input.populateData) {
        return newWorkspace;
      }

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
        .update(workspaceTable)
        .set(updatedWorkspace)
        .where(eq(workspaceTable.id, ctx.workspaceId))
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
          .delete(projectTable)
          .where(eq(projectTable.workspaceId, input.workspaceId));

        await tx.execute(
          sql`DELETE FROM cloud_system AS cs USING cloud_hardware as ch WHERE ch.workspace_id = ${input.workspaceId} AND cs.id = ch.id`,
        );

        await tx
          .delete(hardwareTable)
          .where(eq(hardwareTable.workspaceId, input.workspaceId));

        await tx.execute(
          sql`DELETE FROM cloud_model AS cm USING cloud_system_model as csm WHERE cm.workspace_id = ${input.workspaceId} AND cm.id = csm.id`,
        );

        await tx
          .delete(workspaceTable)
          .where(eq(workspaceTable.id, input.workspaceId));
      });
    }),

  getWorkspaces: protectedProcedure
    .input(z.void())
    .output(
      z.array(
        selectWorkspaceSchema.merge(
          selectWorkspaceUserSchema.pick({ role: true }),
        ),
      ),
    )
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .select({
          workspace: workspaceTable,
          workspaceUser: workspaceUserTable,
        })
        .from(workspaceUserTable)
        .innerJoin(
          workspaceTable,
          eq(workspaceUserTable.workspaceId, workspaceTable.id),
        )
        .innerJoin(userTable, eq(workspaceUserTable.userId, userTable.id))
        .where(eq(userTable.id, ctx.user.id));

      return result.map((w) => ({
        ...w.workspace,
        role: w.workspaceUser.role,
      }));
    }),

  getWorkspaceById: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .output(selectWorkspaceSchema)
    .query(async ({ input }) => {
      const result = await db.query.workspaceTable.findFirst({
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
      const result = await ctx.db.query.workspaceTable.findFirst({
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
