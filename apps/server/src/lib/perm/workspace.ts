import { Result, ok } from "neverthrow";
import { Permission } from "../../types/perm";
import { WorkspaceUser } from "@cloud/shared";
import { workspaceRoleToPerm } from "../perm";

type GetWorkspacePermParams = {
  workspaceUser: WorkspaceUser;
};

export async function checkWorkspacePerm(
  { workspaceUser }: GetWorkspacePermParams,
  perm: Permission,
): Promise<Result<boolean, string>> {
  return ok(perm === workspaceRoleToPerm(workspaceUser.role));
}
