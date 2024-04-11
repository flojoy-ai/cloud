import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { WorkspaceUser, Perm, workspaceRoleToPerm } from "@cloud/shared";

type GetUnitPermParams = {
  unitId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkUnitPerm({
  unitId,
  workspaceUser,
}: GetUnitPermParams): Promise<Result<Perm, string>> {
  const unit = await db
    .selectFrom("unit")
    .selectAll()
    .where("unit.id", "=", unitId)
    .executeTakeFirstOrThrow();

  if (unit.workspaceId !== workspaceUser.workspaceId) {
    return err("Invalid unit ID or you don't have access to it");
  }

  return ok(new Perm(workspaceRoleToPerm(workspaceUser.role)));
}
