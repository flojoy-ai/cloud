import { type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("part_variation_relation")
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .execute();

  await db.schema
    .alterTable("unit_relation")
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable("part_variation_relation")
    .dropColumn("workspace_id")
    .execute();
  await db.schema
    .alterTable("unit_relation")
    .dropColumn("workspace_id")
    .execute();
}
