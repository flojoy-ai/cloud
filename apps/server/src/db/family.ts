import { generateDatabaseId } from "@/lib/db-utils";
import { Kysely } from "kysely";
import type DB from "@/schemas/Database";
import { CreateFamily } from "@/types/family";
import { err, ok } from "neverthrow";

export async function createFamily(db: Kysely<DB>, family: CreateFamily) {
  const res = await db
    .insertInto("family")
    .values({
      id: generateDatabaseId("family"),
      ...family,
    })
    .returning("id")
    .executeTakeFirst();

  if (res === undefined) {
    return err("Failed to create family");
  }

  return ok(res);
}
