import { Kysely } from "kysely";
import type DB from "@/schemas/Database";

export async function markUpdatedAt(
  db: Kysely<DB>,
  table: "project" | "hardware" | "test" | "workspace",
  id: string,
) {
  await db
    .updateTable(table)
    .set({ updatedAt: new Date() })
    .where(`${table}.id`, "=", id)
    .execute();
}
