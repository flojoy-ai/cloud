import { type db } from "~/server/db";

export type AccessContext = {
  db: typeof db;
  userId: string;
  workspaceId: string | null;
};

export const hasWorkspaceAccess = async (
  ctx: AccessContext,
  workspaceId: string,
) => {
  // There are 2 cases:
  // Case 1: Authentication with secret key, in this case workspaceId will be
  // defined in the ctx, thus just need to check if the resource belongs to that
  // workspace, then we will be done.
  if (ctx.workspaceId && workspaceId !== ctx.workspaceId) {
    return false;
  }

  // Case 2: Authentication with session, in this case we need to check if the
  // has access to the workspace that this resource belongs to
  if (!ctx.workspaceId) {
    const perm = await ctx.db.query.workspace_user.findFirst({
      where: (workspace_user, { and, eq }) =>
        and(
          eq(workspace_user.workspaceId, workspaceId),
          eq(workspace_user.userId, ctx.userId),
        ),
    });
    if (!perm) {
      return false;
    }
  }

  return true;
};
