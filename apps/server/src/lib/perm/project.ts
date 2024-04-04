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

type GetProjectPermParams = {
  projectId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkProjectPerm(
  { projectId, workspaceUser }: GetProjectPermParams,
  perm: Permission,
): Promise<Result<boolean, string>> {
  const projectUser = await db
    .selectFrom("project_user as pu")
    .selectAll()
    .where("pu.userId", "=", workspaceUser.userId)
    .where("pu.projectId", "=", projectId)
    .executeTakeFirst();

  if (!projectUser) {
    return err("Invalid project ID or you don't have access to it");
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
