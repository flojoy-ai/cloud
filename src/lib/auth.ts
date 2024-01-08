import { type db } from "~/server/db";
import { type SelectWorkspaceUser } from "~/types/workspace_user";

export type AccessContext = {
  db: typeof db;
  userId: string;
  workspaceId: string | null;
};

export const checkWorkspaceAccess = async (
  ctx: AccessContext,
  workspaceId: string,
): Promise<SelectWorkspaceUser | null> => {
  // Authentication with secret key, the key potentially does not have
  // access to this workspace
  if (ctx.workspaceId && workspaceId !== ctx.workspaceId) {
    return null;
  }

  // Then we need to check if the key/user has access
  // to the workspace that this resource belongs to
  const perm = await ctx.db.query.workspace_user.findFirst({
    where: (workspace_user, { and, eq }) =>
      and(
        eq(workspace_user.workspaceId, workspaceId),
        eq(workspace_user.userId, ctx.userId),
      ),
  });

  return perm ?? null;
};
