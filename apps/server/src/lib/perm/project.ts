import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import {
  WorkspaceUser,
  Perm,
  projectRoleToPerm,
  workspaceRoleToPerm,
} from "@cloud/shared";

type GetProjectPermParams = {
  projectId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkProjectPerm({
  projectId,
  workspaceUser,
}: GetProjectPermParams): Promise<Result<Perm, string>> {
  const workspacePerm = new Perm(workspaceRoleToPerm(workspaceUser.role));
  if (workspacePerm.canAdmin()) {
    return ok(workspacePerm);
  }

  const projectUser = await db
    .selectFrom("project_user as pu")
    .selectAll()
    .where("pu.userId", "=", workspaceUser.userId)
    .where("pu.projectId", "=", projectId)
    .executeTakeFirst();

  if (!projectUser) {
    return err("Invalid project ID or you don't have access to it");
  }

  return ok(new Perm(projectRoleToPerm(projectUser.role)));
}
