import { type Kysely } from "kysely";
import type Database from "~/schemas/Database";

export async function getHardwareById(db: Kysely<Database>, projectId: string) {
  const [project] = await db
    .selectFrom("hardware")
    .selectAll("hardware")
    .where("hardware.id", "=", projectId)
    .limit(1)
    .execute();

  return project;
}
