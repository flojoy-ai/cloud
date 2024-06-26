import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import {
  WorkspaceUser,
  Perm,
  projectRoleToPerm,
  workspaceRoleToPerm,
} from "@cloud/shared";

type GetSessionPermParams = {
  sessionId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkSessionPerm({
  sessionId,
  workspaceUser,
}: GetSessionPermParams): Promise<Result<Perm, string>> {
  const workspacePerm = new Perm(workspaceRoleToPerm(workspaceUser.role));
  if (workspacePerm.canAdmin()) {
    return ok(workspacePerm);
  }

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

  return ok(new Perm(projectRoleToPerm(projectUser.role)));
}
