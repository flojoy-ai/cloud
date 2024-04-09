import { Kysely } from "kysely";
import { generateDatabaseId } from "../lib/db-utils";
import { DB, InsertTest } from "@cloud/shared";
import { err, ok } from "neverthrow";

export async function createTest(db: Kysely<DB>, input: InsertTest) {
  const test = await db
    .insertInto("test")
    .values({
      id: generateDatabaseId("test"),
      ...input,
    })
    .returningAll()
    .executeTakeFirst();

  if (test === undefined) {
    return err("Failed to create test");
  }

  return ok(test);
}

export async function getTest(db: Kysely<DB>, test: string) {
  return await db
    .selectFrom("test")
    .selectAll("test")
    .where("test.id", "=", test)
    .executeTakeFirst();
}

export async function getTestByName(db: Kysely<DB>, name: string) {
  return await db
    .selectFrom("test")
    .selectAll("test")
    .where("test.name", "=", name)
    .executeTakeFirst();
}
