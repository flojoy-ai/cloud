import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { Permission } from "../../types/perm";
import { WorkspaceUser } from "@cloud/shared";
import { canAdmin, canRead, canWrite, workspaceRoleToPerm } from "../perm";

type GetUnitPermParams = {
  unitId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkUnitPerm(
  { unitId, workspaceUser }: GetUnitPermParams,
  perm: Permission,
): Promise<Result<boolean, string>> {
  const unit = await db
    .selectFrom("unit")
    .selectAll()
    .where("unit.id", "=", unitId)
    .executeTakeFirstOrThrow();

  if (unit.workspaceId !== workspaceUser.workspaceId) {
    return err("Invalid unit ID or you don't have access to it");
  }

  switch (perm) {
    case "read":
      return ok(canRead(workspaceRoleToPerm(workspaceUser.role)));
    case "write":
      return ok(canWrite(workspaceRoleToPerm(workspaceUser.role)));
    case "admin":
      return ok(canAdmin(workspaceRoleToPerm(workspaceUser.role)));
  }
}
