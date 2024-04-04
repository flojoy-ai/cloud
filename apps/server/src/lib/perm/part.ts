import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { WorkspaceUser } from "@cloud/shared";
import { Perm, workspaceRoleToPerm } from "../perm";

type GetPartPermParams = {
  partId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkPartPerm({
  partId,
  workspaceUser,
}: GetPartPermParams): Promise<Result<Perm, string>> {
  const part = await db
    .selectFrom("part")
    .selectAll()
    .where("part.id", "=", partId)
    .executeTakeFirstOrThrow();

  if (part.workspaceId !== workspaceUser.workspaceId) {
    return err("Invalid Part ID or you don't have access to it");
  }

  return ok(new Perm(workspaceRoleToPerm(workspaceUser.role)));
}
