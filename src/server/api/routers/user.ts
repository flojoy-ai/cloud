import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { workspaceAccessMiddleware } from "./workspace";
import { render } from "@react-email/render";
import { WorkspaceUserInvite } from "~/emails/workspace-user-invite";
import { sendEmailWithSES } from "~/lib/email";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";
import _ from "lodash";
import { userInvite } from "~/schemas/public/UserInvite";
import { generateDatabaseId } from "~/lib/id";
import { createUserInvite } from "~/types/user";
import { user } from "~/schemas/public/User";
import { workspaceUser } from "~/schemas/public/WorkspaceUser";

export const userRouter = createTRPCRouter({
  getUsersInWorkspace: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(
      z.array(
        user.extend({
          role: workspaceUser.pick({ role: true }),
        }),
      ),
    )
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .selectFrom("workspace_user as wu")
        .where("wu.workspaceId", "=", input.workspaceId)
        .innerJoin("user as u", "u.id", "wu.userId")
        .innerJoin("workspace as w", "w.id", "wu.workspaceId")
        .selectAll("u")
        .select("wu.role as role")
        .execute();

      return result;
    }),

  addUserToWorkspace: protectedProcedure
    .input(createUserInvite)
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      const currentWorkspaceUser = await ctx.db
        .selectFrom("workspace_user")
        .where("userId", "=", ctx.user.id)
        .where("workspaceId", "=", ctx.workspace.id)
        .selectAll()
        .executeTakeFirst();

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

      await ctx.db.transaction().execute(async (trx) => {
        await trx
          .deleteFrom("user_invite")
          .where("email", "=", input.email)
          .where("workspaceId", "=", ctx.workspace.id)
          .execute();

        await trx
          .insertInto("user_invite")
          .values({
            id: generateDatabaseId("user_invite"),
            email: input.email,
            workspaceId: ctx.workspace.id,
            role: input.role,
          })
          .execute();
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
      const currentWorkspaceUser = await ctx.db
        .selectFrom("workspace_user")
        .where("userId", "=", ctx.user.id)
        .where("workspaceId", "=", input.workspaceId)
        .selectAll()
        .executeTakeFirst();

      if (
        currentWorkspaceUser?.role !== "owner" &&
        currentWorkspaceUser?.role !== "admin"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You do not have permission to remove users from this workspace",
        });
      }

      if (
        currentWorkspaceUser.role === "owner" &&
        input.userId === currentWorkspaceUser.userId
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot remove yourself from the workspace",
        });
      }

      await ctx.db
        .deleteFrom("workspace_user")
        .where("userId", "=", input.userId)
        .where("workspaceId", "=", input.workspaceId)
        .execute();
    }),

  getAllWorkspaceInvites: protectedProcedure
    .output(z.array(userInvite.extend({ workspaceName: z.string() })))
    .query(async ({ ctx }) => {
      const result = ctx.db
        .selectFrom("user_invite as ui")
        .where("ui.email", "=", "ctx.user.email")
        .innerJoin("workspace as w", "w.id", "ui.workspaceId")
        .selectAll("ui")
        .select("w.name as workspaceName")
        .execute();
      return result;
    }),

  acceptWorkspaceInvite: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const invite = await ctx.db
        .selectFrom("user_invite as ui")
        .where("ui.email", "=", ctx.user.email)
        .where("ui.workspaceId", "=", input.workspaceId)
        .selectAll()
        .executeTakeFirst();

      if (!invite) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invite not found",
        });
      }

      await ctx.db.transaction().execute(async (trx) => {
        await trx
          .insertInto("workspace_user")
          .values({
            userId: ctx.user.id,
            workspaceId: input.workspaceId,
            role: invite.role,
          })
          .execute();

        await trx
          .deleteFrom("user_invite as ui")
          .where("ui.email", "=", ctx.user.email)
          .where("ui.workspaceId", "=", input.workspaceId)
          .execute();
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
        .deleteFrom("user_invite as ui")
        .where("ui.email", "=", ctx.user.email)
        .where("ui.workspaceId", "=", input.workspaceId)
        .execute();
    }),
});
