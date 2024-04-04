import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { Permission } from "../../types/perm";
import { WorkspaceUser } from "@cloud/shared";
import {
  canAdmin,
  canRead,
  canWrite,
  isPending,
  workspaceRoleToPerm,
} from "../perm";

type GetPartPermParams = {
  partId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkPartPerm(
  { partId, workspaceUser }: GetPartPermParams,
  perm: Permission,
): Promise<Result<boolean, string>> {
  const part = await db
    .selectFrom("part")
    .selectAll()
    .where("part.id", "=", partId)
    .executeTakeFirstOrThrow();

  if (part.workspaceId !== workspaceUser.workspaceId) {
    return err("Invalid Part ID or you don't have access to it");
  }

  switch (perm) {
    case "read":
      return ok(canRead(workspaceRoleToPerm(workspaceUser.role)));
    case "write":
      return ok(canWrite(workspaceRoleToPerm(workspaceUser.role)));
    case "admin":
      return ok(canAdmin(workspaceRoleToPerm(workspaceUser.role)));
    case "pending":
      return ok(isPending(workspaceRoleToPerm(workspaceUser.role)));
  }
}
