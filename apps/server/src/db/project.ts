import type DB from "@/schemas/Database";
import { Kysely } from "kysely";
import { generateDatabaseId } from "@/lib/db-utils";
import { CreateProjectSchema } from "@/types/project";
import { Result, err, ok } from "neverthrow";
import { Project } from "@/schemas/public/Project";

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
