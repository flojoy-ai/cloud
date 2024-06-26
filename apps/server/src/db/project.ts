import { ExpressionBuilder, Kysely } from "kysely";
import { generateDatabaseId, tryQuery } from "../lib/db-utils";
import {
  DB,
  Project,
  CreateProjectSchema,
  UpdateProjectSchema,
} from "@cloud/shared";
import { Result, err, ok } from "neverthrow";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { InternalServerError } from "../lib/error";

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

export async function updateProject(
  db: Kysely<DB>,
  projectId: string,
  body: UpdateProjectSchema,
) {
  return await tryQuery(
    db
      .updateTable("project")
      .set({
        ...body,
      })
      .where("project.id", "=", projectId)
      .returningAll()
      .executeTakeFirstOrThrow(
        () => new InternalServerError("Failed to update test profile"),
      ),
  );
}
