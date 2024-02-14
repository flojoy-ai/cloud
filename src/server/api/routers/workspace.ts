import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { cookies } from "next/headers";
import { workspace } from "~/schemas/public/Workspace";

import { generateDatabaseId } from "~/lib/id";
import { type db } from "~/server/db";
import { createWorkspace, updateWorkspace } from "~/types/workspace";
import { api } from "~/trpc/server";
import { type DatabaseError } from "pg";
import { withDBErrorCheck } from "~/types/db-utils";

export const workspaceAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: db; user: { id: string }; workspaceId: string | null };
  input: { workspaceId: string };
}>().create(async (opts) => {
  const workspace = await opts.ctx.db
    .selectFrom("workspace")
    .where("workspace.id", "=", opts.input.workspaceId)
    .selectAll()
    .executeTakeFirst();

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
    .input(createWorkspace)
    .output(workspace)
    .mutation(async ({ ctx, input }) => {
      const { populateData, ...data } = input;

      const newWorkspace = await ctx.db.transaction().execute(async (tx) => {
        const newWorkspace = await withDBErrorCheck(
          tx
            .insertInto("workspace")
            .values({
              id: generateDatabaseId("workspace"),
              ...data,
              planType: "enterprise",
            })
            .returningAll()
            .executeTakeFirst(),
          {
            errorCode: "DUPLICATE",
            errorMsg: `Workspace with namespace "${data.namespace}" already exists`,
          },
        );

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

      if (!populateData) {
        return newWorkspace;
      }

      await api.example.populateExample.mutate({
        workspaceId: newWorkspace.id,
      });

      return newWorkspace;
    }),
  updateWorkspace: workspaceProcedure
    .input(
      z.object({
        workspaceId: z.string(),
        data: updateWorkspace.required(),
      }),
    )
    .use(workspaceAccessMiddleware)
    .output(workspace)
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceUser.role === "member") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to update this workspace",
        });
      }

      const result = await withDBErrorCheck(
        ctx.db
          .updateTable("workspace")
          .set({
            ...input.data,
          })
          .where("workspace.id", "=", ctx.workspaceId)
          .returningAll()
          .executeTakeFirstOrThrow(
            () =>
              new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to update workspace",
              }),
          ),
        {
          errorCode: "DUPLICATE",
          errorMsg: `Workspace with namespace "${input.data.namespace}" already exists!`,
        },
      );
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
        // FIX: this is not working
        await tx
          .deleteFrom("project")
          .where("project.workspaceId", "=", input.workspaceId)
          .execute();

        await tx
          .deleteFrom("hardware")
          .where("hardware.workspaceId", "=", input.workspaceId)
          .execute();

        const models = await tx
          .selectFrom("model")
          .select("id")
          .where("model.workspaceId", "=", input.workspaceId)
          .execute();

        await tx
          .deleteFrom("model_relation")
          .where(
            "parentModelId",
            "in",
            models.map((m) => m.id),
          )
          .execute();

        await tx
          .deleteFrom("model")
          .where("model.workspaceId", "=", input.workspaceId)
          .execute();

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
        .innerJoin("workspace as w", "w.id", "wu.workspaceId")
        .innerJoin("user as u", "u.id", "wu.userId")
        .where("wu.userId", "=", ctx.user.id)
        .selectAll("w")
        .execute();
      return result;
    }),

  getWorkspaceById: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .output(workspace)
    .use(workspaceAccessMiddleware)
    .query(async ({ ctx }) => {
      return ctx.workspace;
    }),

  getWorkspaceIdByNamespace: protectedProcedure
    .input(z.object({ namespace: z.string() }))
    .output(z.string())
    .query(async ({ input, ctx }) => {
      // FIXME: auth check is needed here
      const result = await ctx.db
        .selectFrom("workspace")
        .selectAll()
        .where("workspace.namespace", "=", input.namespace)
        .executeTakeFirst();

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }
      return result.id;
    }),
});

const handleNamespaceConflict = (err: DatabaseError, namespace: string) => {
  if (err.code === "23505") {
    return new TRPCError({
      code: "CONFLICT",
      message: `A workspace with namespace "${namespace}" already exists!`,
    });
  }
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    cause: err,
    message: err.message ?? "Internal server error",
  });
};
