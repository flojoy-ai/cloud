import type DB from "../schemas/Database";
import { Kysely } from "kysely";
import { generateDatabaseId } from "../lib/db-utils";
import { InsertTest } from "../types/test";
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
