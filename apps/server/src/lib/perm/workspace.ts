import { Result, ok } from "neverthrow";
import { WorkspaceUser, Perm, workspaceRoleToPerm } from "@cloud/shared";

type GetWorkspacePermParams = {
  workspaceUser: WorkspaceUser;
};

export async function checkWorkspacePerm({
  workspaceUser,
}: GetWorkspacePermParams): Promise<Result<Perm, string>> {
  return ok(new Perm(workspaceRoleToPerm(workspaceUser.role)));
}
