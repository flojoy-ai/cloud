import { Result, ok } from "neverthrow";
import { Permission } from "../../types/perm";
import { WorkspaceUser } from "@cloud/shared";
import { canAdmin, canRead, canWrite, workspaceRoleToPerm } from "../perm";

type GetWorkspacePermParams = {
  workspaceUser: WorkspaceUser;
};

export async function checkWorkspacePerm(
  { workspaceUser }: GetWorkspacePermParams,
  perm: Permission,
): Promise<Result<boolean, string>> {
  switch (perm) {
    case "read":
      return ok(canRead(workspaceRoleToPerm(workspaceUser.role)));
    case "write":
      return ok(canWrite(workspaceRoleToPerm(workspaceUser.role)));
    case "admin":
      return ok(canAdmin(workspaceRoleToPerm(workspaceUser.role)));
  }
}
