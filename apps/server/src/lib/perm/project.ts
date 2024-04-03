import { User } from "lucia";
import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { Permission } from "../../types/perm";

type GetProjectPermParams = {
  projectId: string;
  user: User;
};

export async function getProjectPerm({
  projectId,
  user,
}: GetProjectPermParams): Promise<Result<Permission, string>> {
  const projectUser = await db
    .selectFrom("project_user as pu")
    .selectAll()
    .where("pu.workspaceId", "=", user.id)
    .where("pu.projectId", "=", projectId)
    .executeTakeFirst();

  if (!projectUser) {
    return err("Invalid project ID or you don't have access to it");
  }

  switch (projectUser.role) {
    case "test":
      return ok("read" satisfies Permission);

    case "dev":
      return ok("write" satisfies Permission);
  }
}
