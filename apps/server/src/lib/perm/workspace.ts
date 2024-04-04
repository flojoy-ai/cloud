import { Result, ok } from "neverthrow";
import { WorkspaceUser } from "@cloud/shared";
import { Perm, workspaceRoleToPerm } from "../perm";

type GetWorkspacePermParams = {
  workspaceUser: WorkspaceUser;
};

export async function checkWorkspacePerm({
  workspaceUser,
}: GetWorkspacePermParams): Promise<Result<Perm, string>> {
  return ok(new Perm(workspaceRoleToPerm(workspaceUser.role)));
}
