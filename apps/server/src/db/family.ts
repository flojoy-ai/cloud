import { generateDatabaseId } from "@/lib/db-utils";
import { Kysely } from "kysely";
import type DB from "@/schemas/Database";
import { InsertFamily } from "@/types/family";
import { Result, err, ok } from "neverthrow";
import { Family } from "@/schemas/public/Family";

export async function createFamily(
  db: Kysely<DB>,
  family: InsertFamily,
): Promise<Result<Family, string>> {
  const res = await db
    .insertInto("family")
    .values({
      id: generateDatabaseId("family"),
      ...family,
    })
    .returningAll()
    .executeTakeFirst();

  if (res === undefined) {
    return err("Failed to create family");
  }

  return ok(res);
}
