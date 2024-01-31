import { type db } from "~/server/db";
import { type SelectWorkspaceUser } from "~/types/workspace_user";

export type AccessContext = {
  db: typeof db;
  userId: string;
  workspaceId: string | null;
};

export const checkWorkspaceAccess = async (
  ctx: AccessContext,
  workspaceIdOfTheResource: string,
): Promise<SelectWorkspaceUser | null> => {
  if (ctx.workspaceId && workspaceIdOfTheResource !== ctx.workspaceId) {
    // This is for when we are authenticating with the secret key.
    // Each secret key specifies the workspace ID it has access to, and this
    // ID will be passed to here in context.
    // If the ID in context does not align with the workspace ID of the resource,
    // then we reject.
    return null;
  }

  // Now we need to make sure the given user in ctx has access to the workspace
  // that holds the resource. The userId field in ctx is always non-null no matter
  // you are authenticating with a secret key or a user session.
  const perm = await ctx.db.query.workspaceUserTable.findFirst({
    where: (workspace_user, { and, eq }) =>
      and(
        eq(workspace_user.workspaceId, workspaceIdOfTheResource),
        eq(workspace_user.userId, ctx.userId),
      ),
  });

  return perm ?? null;
};
