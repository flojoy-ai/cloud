import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { workspaceAccessMiddleware } from "./workspace";
import { selectWorkspaceUserSchema } from "~/types/workspace_user";
import {
  userInviteTable,
  userTable,
  workspaceTable,
  workspaceUserTable,
} from "~/server/db/schema";
import { and, eq } from "drizzle-orm";
import {
  insertUserInviteSchema,
  selectUserInviteSchema,
  selectUserSchema,
} from "~/types/user";
import { selectWorkspaceSchema } from "~/types/workspace";
import { render } from "@react-email/render";
import { WorkspaceUserInvite } from "~/emails/workspace-user-invite";
import { sendEmailWithSES } from "~/lib/email";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import _ from "lodash";

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

  addUserToWorkspace: protectedProcedure
    .input(insertUserInviteSchema)
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const currentWorkspaceUser =
        await ctx.db.query.workspaceUserTable.findFirst({
          where: (wu, { and, eq }) =>
            and(
              eq(wu.userId, ctx.user.id),
              eq(wu.workspaceId, ctx.workspace.id),
            ),
        });

      if (!currentWorkspaceUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Something went wrong :(",
        });
      }

      if (!_.includes(["admin", "owner"], currentWorkspaceUser.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to add users to this workspace",
        });
      }

      await ctx.db.transaction(async (trx) => {
        await trx
          .delete(userInviteTable)
          .where(
            and(
              eq(userInviteTable.email, input.email),
              eq(userInviteTable.workspaceId, ctx.workspace.id),
            ),
          );

        await trx.insert(userInviteTable).values({
          email: input.email,
          workspaceId: ctx.workspace.id,
          role: input.role,
        });
      });

      const emailHtml = render(
        WorkspaceUserInvite({
          fromEmail: ctx.user.email,
          workspaceName: ctx.workspace.name,
          inviteLink: env.NEXT_PUBLIC_URL_ORIGIN + "/workspace/invites",
        }),
      );
      await sendEmailWithSES({
        recipients: [input.email],
        emailHtml,
        subject: "Flojoy Cloud - Invite to join workspace",
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

  getAllWorkspaceInvites: protectedProcedure
    .output(
      z.array(
        selectUserInviteSchema.extend({ workspace: selectWorkspaceSchema }),
      ),
    )
    .query(async ({ ctx }) => {
      const result = ctx.db.query.userInviteTable.findMany({
        where: (ui) => eq(ui.email, ctx.user.email),
        with: {
          workspace: true,
        },
      });
      return result;
    }),

  acceptWorkspaceInvite: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db.query.userInviteTable.findFirst({
        where: (ui) =>
          and(
            eq(ui.email, ctx.user.email),
            eq(ui.workspaceId, input.workspaceId),
          ),
      });

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      await ctx.db.transaction(async (trx) => {
        await trx.insert(workspaceUserTable).values({
          userId: ctx.user.id,
          workspaceId: input.workspaceId,
          role: invite.role,
        });

        await trx
          .delete(userInviteTable)
          .where(
            and(
              eq(userInviteTable.email, ctx.user.email),
              eq(userInviteTable.workspaceId, input.workspaceId),
            ),
          );
      });
    }),

  rejectWorkspaceInvite: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(userInviteTable)
        .where(
          and(
            eq(userInviteTable.email, ctx.user.email),
            eq(userInviteTable.workspaceId, input.workspaceId),
          ),
        );
    }),
});
