import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("part_variation_type")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text")
    .execute();

  await db.schema
    .createTable("part_variation_market")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text")
    .execute();

  await db.schema
    .alterTable("part_variation")
    .addColumn("type_id", "text", (col) =>
      col.references("part_variation_type.id"),
    )
    .addColumn("market_id", "text", (col) =>
      col.references("part_variation_market.id"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("part_variation")
    .dropColumn("type")
    .dropColumn("market")
    .execute();

  await db.schema.dropTable("part_variation_type").execute();
  await db.schema.dropTable("part_variation_market").execute();
}
