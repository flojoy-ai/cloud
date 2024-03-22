import type DB from "@/schemas/Database";
import { Kysely } from "kysely";
import { generateDatabaseId } from "@/lib/db-utils";
import { InsertProject } from "@/types/project";
import { err } from "neverthrow";

export async function createProject(db: Kysely<DB>, input: InsertProject) {
  const project = await db
    .insertInto("project")
    .values({
      id: generateDatabaseId("project"),
      ...input,
    })
    .returningAll()
    .executeTakeFirst();

  if (project === undefined) {
    return err("Failed to create project");
  }

  return project;
}
