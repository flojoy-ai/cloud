import { type Kysely } from "kysely";
import type Database from "~/schemas/Database";

export async function getProjectById(db: Kysely<Database>, projectId: string) {
  const [project] = await db
    .selectFrom("project")
    .selectAll("project")
    .where("project.id", "=", projectId)
    .limit(1)
    .execute();

  return project;
}
