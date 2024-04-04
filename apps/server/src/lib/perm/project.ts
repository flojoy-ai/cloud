import { User } from "lucia";
import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { Permission } from "../../types/perm";
import { projectRoleToPerm } from "../perm";

type GetProjectPermParams = {
  projectId: string;
  user: User;
};

export async function checkProjectPerm(
  { projectId, user }: GetProjectPermParams,
  perm: Permission,
): Promise<Result<boolean, string>> {
  const projectUser = await db
    .selectFrom("project_user as pu")
    .selectAll()
    .where("pu.userId", "=", user.id)
    .where("pu.projectId", "=", projectId)
    .executeTakeFirst();

  if (!projectUser) {
    return err("Invalid project ID or you don't have access to it");
  }

  return ok(perm === projectRoleToPerm(projectUser.role));
}
