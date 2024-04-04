import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { Permission } from "../../types/perm";
import {
  canAdmin,
  canRead,
  canWrite,
  isPending,
  projectRoleToPerm,
} from "../perm";
import { WorkspaceUser } from "@cloud/shared";

type GetSessionPermParams = {
  sessionId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkSessionPerm(
  { sessionId, workspaceUser }: GetSessionPermParams,
  perm: Permission,
): Promise<Result<boolean, string>> {
  const session = await db
    .selectFrom("session as s")
    .selectAll()
    .where("s.id", "=", sessionId)
    .executeTakeFirstOrThrow();

  const projectUser = await db
    .selectFrom("project_user as pu")
    .selectAll()
    .where("pu.userId", "=", workspaceUser.userId)
    .where("pu.projectId", "=", session.projectId)
    .executeTakeFirstOrThrow();

  if (
    projectUser.userId !== workspaceUser.userId ||
    projectUser.workspaceId !== workspaceUser.workspaceId
  ) {
    return err("Invalid Session ID or you don't have access to it");
  }

  switch (perm) {
    case "read":
      return ok(canRead(projectRoleToPerm(projectUser.role)));
    case "write":
      return ok(canWrite(projectRoleToPerm(projectUser.role)));
    case "admin":
      return ok(canAdmin(projectRoleToPerm(projectUser.role)));
    case "pending":
      return ok(isPending(projectRoleToPerm(projectUser.role)));
  }
}
