import { Kysely } from "kysely";
import { generateDatabaseId } from "../lib/db-utils";
import { DB, Project, CreateProjectSchema } from "@cloud/shared";
import { Result, err, ok } from "neverthrow";

export async function createProject(
  db: Kysely<DB>,
  input: CreateProjectSchema,
): Promise<Result<Project, string>> {
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

  return ok(project);
}
