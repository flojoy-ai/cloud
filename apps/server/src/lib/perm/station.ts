import { db } from "../../db/kysely";
import { Result, err, ok } from "neverthrow";
import { Perm, projectRoleToPerm } from "../perm";
import { WorkspaceUser } from "@cloud/shared";

type GetStationPermParams = {
  stationId: string;
  workspaceUser: WorkspaceUser;
};

export async function checkStationPerm({
  stationId,
  workspaceUser,
}: GetStationPermParams): Promise<Result<Perm, string>> {
  const station = await db
    .selectFrom("station as s")
    .selectAll()
    .where("s.id", "=", stationId)
    .executeTakeFirstOrThrow();

  const projectUser = await db
    .selectFrom("project_user as pu")
    .selectAll()
    .where("pu.userId", "=", workspaceUser.userId)
    .where("pu.projectId", "=", station.projectId)
    .executeTakeFirstOrThrow();

  if (
    projectUser.userId !== workspaceUser.userId ||
    projectUser.workspaceId !== workspaceUser.workspaceId
  ) {
    return err("Invalid station ID or you don't have access to it");
  }

  return ok(new Perm(projectRoleToPerm(projectUser.role)));
}
