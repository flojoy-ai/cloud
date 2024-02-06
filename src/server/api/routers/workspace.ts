import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { cookies } from "next/headers";
import {
  workspace,
  workspaceInitializer,
  workspaceMutator,
} from "~/schemas/public/Workspace";

import { generateDatabaseId } from "~/lib/id";
import { type db } from "~/server/db";

export const workspaceAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: db; user: { id: string }; workspaceId: string | null };
  input: { workspaceId: string };
}>().create(async (opts) => {
  const [workspace] = await opts.ctx.db
    .selectFrom("workspace")
    .where("workspace.id", "=", opts.input.workspaceId)
    .execute();

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
      workspaceUser,
    },
  });
});

export const workspaceRouter = createTRPCRouter({
  createWorkspace: protectedProcedure
    .input(workspaceInitializer.omit({ id: true }))
    .output(workspace)
    .mutation(async ({ ctx, input }) => {
      const newWorkspace = await ctx.db.transaction().execute(async (tx) => {
        const newWorkspace = await tx
          .insertInto("workspace")
          .values({
            id: generateDatabaseId("workspace"),
            ...input,
            planType: "enterprise",
          })
          .returningAll()
          .executeTakeFirst();

        if (!newWorkspace) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace",
          });
        }

        await tx
          .insertInto("workspace_user")
          .values({
            workspaceId: newWorkspace.id,
            userId: ctx.user.id,
            role: "owner" as const,
          })
          .execute();

        cookies().set("scope", newWorkspace.namespace);

        return newWorkspace;
      });

      // TODO: just make a separate call
      //
      // if (!input.populateData) {
      //   return newWorkspace;
      // }
      //
      // await api.example.populateExample.mutate({
      //   workspaceId: newWorkspace.id,
      // });

      return newWorkspace;
    }),

  updateWorkspace: workspaceProcedure
    .input(workspaceMutator)
    .output(workspace)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...updatedWorkspace } = input;

      const result = await ctx.db
        .updateTable("workspace")
        .set({
          ...updatedWorkspace,
        })
        .where("workspace.id", "=", ctx.workspaceId)
        .returningAll()
        .executeTakeFirst();

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
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      return await ctx.db.transaction().execute(async (tx) => {
        // TODO: need to verify if this is correct
        await tx
          .deleteFrom("project")
          .where("project.workspaceId", "=", input.workspaceId)
          .execute();

        // await tx.execute(
        //   sql`DELETE FROM cloud_system AS cs USING cloud_hardware as ch WHERE ch.workspace_id = ${input.workspaceId} AND cs.id = ch.id`,
        // );

        await tx
          .deleteFrom("hardware")
          .where("hardware.workspaceId", "=", input.workspaceId)
          .execute();

        await tx
          .deleteFrom("model")
          .where("model.workspaceId", "=", input.workspaceId)
          .execute();

        // await tx.execute(
        //   sql`DELETE FROM cloud_model AS cm USING cloud_system_model as csm WHERE cm.workspace_id = ${input.workspaceId} AND cm.id = csm.id`,
        // );

        await tx
          .deleteFrom("workspace")
          .where("workspace.id", "=", input.workspaceId)
          .execute();
      });
    }),

  getWorkspaces: protectedProcedure
    .input(z.void())
    .output(z.array(workspace))
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .selectFrom("workspace_user as wu")
        .innerJoin("workspace as w", "w.id", "wu.userId")
        .innerJoin("user as u", "u.id", "wu.userId")
        .where("wu.userId", "=", ctx.user.id)
        .selectAll("w")
        .execute();
      return result;
    }),

  getWorkspaceById: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .output(workspace)
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .selectFrom("workspace")
        .selectAll()
        .where("workspace.id", "=", input.workspaceId)
        .executeTakeFirst();

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
      const result = await ctx.db
        .selectFrom("workspace")
        .selectAll()
        .where("workspace.namespace", "=", input.namespace)
        .executeTakeFirst();

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workspace not found",
        });
      }
      return result.id;
    }),
});
