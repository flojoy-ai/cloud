import { ExpressionBuilder, Kysely } from "kysely";
import { generateDatabaseId } from "../lib/db-utils";
import { DB, Project, CreateProjectSchema } from "@cloud/shared";
import { Result, err, ok } from "neverthrow";
import { jsonArrayFrom } from "kysely/helpers/postgres";

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

export function withProjectTests(eb: ExpressionBuilder<DB, "project">) {
  return jsonArrayFrom(
    eb
      .selectFrom("test")
      .selectAll("test")
      .whereRef("test.projectId", "=", "project.id"),
  ).as("tests");
}

export function withProjectUnits(eb: ExpressionBuilder<DB, "project">) {
  return jsonArrayFrom(
    eb
      .selectFrom("project_unit")
      .innerJoin("unit", "unit.id", "project_unit.unitId")
      .selectAll("unit")
      .whereRef("project_unit.projectId", "=", "project.id"),
  ).as("units");
}

export async function getProject(db: Kysely<DB>, projectId: string) {
  return await db
    .selectFrom("project")
    .selectAll("project")
    .select((eb) => [withProjectTests(eb), withProjectUnits(eb)])
    .where("project.id", "=", projectId)
    .executeTakeFirst();
}
