import { z } from "zod";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { workspaceAccessMiddleware } from "./workspace";
import { selectWorkspaceUserSchema } from "~/types/workspace_user";
import {
  userTable,
  workspaceTable,
  workspaceUserTable,
} from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import { selectUserSchema } from "~/types/user";
import { selectWorkspaceSchema } from "~/types/workspace";

export const userRouter = createTRPCRouter({
  getUsersInWorkspace: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(
      z.array(
        z.object({
          user: selectUserSchema,
          workspace: selectWorkspaceSchema,
          workspace_user: selectWorkspaceUserSchema,
        }),
      ),
    )
    .query(({ ctx, input }) => {
      const result = ctx.db
        .select()
        .from(workspaceUserTable)
        .where(eq(workspaceUserTable.workspaceId, input.workspaceId))
        .innerJoin(userTable, eq(userTable.id, workspaceUserTable.userId))
        .innerJoin(
          workspaceTable,
          eq(workspaceTable.id, workspaceUserTable.workspaceId),
        );
      return result;
    }),

  addUserToWorkspace: workspaceProcedure
    .input(selectWorkspaceUserSchema)
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const currentWorkspaceUser =
        await ctx.db.query.workspaceUserTable.findFirst({
          where: (wu, { and, eq }) =>
            and(
              eq(wu.userId, input.userId),
              eq(wu.workspaceId, input.workspaceId),
            ),
        });

      if (
        currentWorkspaceUser?.role !== "owner" &&
        currentWorkspaceUser?.role !== "admin"
      ) {
        throw new Error(
          "You don't have permission to add users to this workspace",
        );
      }

      await ctx.db.insert(workspaceUserTable).values({
        ...input,
        isPending: true,
      });
    }),

  removeUserFromWorkspace: workspaceProcedure
    .input(z.object({ workspaceId: z.string(), userId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const currentWorkspaceUser =
        await ctx.db.query.workspaceUserTable.findFirst({
          where: (wu, { and, eq }) =>
            and(
              eq(wu.userId, input.userId),
              eq(wu.workspaceId, input.workspaceId),
            ),
        });

      if (
        currentWorkspaceUser?.role !== "owner" &&
        currentWorkspaceUser?.role !== "admin"
      ) {
        throw new Error(
          "You don't have permission to remove users from this workspace",
        );
      }

      await ctx.db
        .delete(workspaceUserTable)
        .where(
          and(
            eq(workspaceUserTable.userId, input.userId),
            eq(workspaceUserTable.workspaceId, input.workspaceId),
          ),
        );
    }),

  // updateRoleInWorkspace: workspaceProcedure
  //   .input(
  //     z.object({
  //       workspaceId: z.string(),
  //       userId: z.string(),
  //       role: z.enum(["ADMIN", "USER"]),
  //     }),
  //   )
  //   .use(workspaceAccessMiddleware)
  //   .output(z.object({ success: z.boolean() }))
  //   .mutation(async ({ ctx, input }) => {
  //     await ctx.db.workspace_user.update({
  //       where: {
  //         userId_workspaceId: {
  //           userId: input.userId,
  //           workspaceId: input.workspaceId,
  //         },
  //       },
  //       data: {
  //         role: input.role,
  //       },
  //     });
  //     return { success: true };
  //   }),
});
