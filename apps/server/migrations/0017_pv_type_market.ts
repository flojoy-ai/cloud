import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("part_variation")
    .addColumn("type", "text")
    .addColumn("market", "text")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("part_variation")
    .dropColumn("type")
    .dropColumn("market")
    .execute();
}
