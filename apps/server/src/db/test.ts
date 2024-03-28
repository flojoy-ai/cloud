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
