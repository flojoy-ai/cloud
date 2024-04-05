import { db } from "./kysely";

export async function getWorkspaceUser(workspaceId: string, userId: string) {
  return await db
    .selectFrom("workspace_user as wu")
    .selectAll()
    .where("wu.workspaceId", "=", workspaceId)
    .where("wu.userId", "=", userId)
    .executeTakeFirst();
}
