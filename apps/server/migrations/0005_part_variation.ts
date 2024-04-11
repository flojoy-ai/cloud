import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("part_variation")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("part_id", "text", (col) =>
      col.notNull().references("part.id").onDelete("cascade"),
    )
    .addColumn("part_number", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("part_variation_workspace_id_part_number_unique", [
      "workspace_id",
      "part_number",
    ])
    .execute();

  await db.schema
    .createIndex("part_variation_part_number_index")
    .on("part_variation")
    .column("part_number")
    .execute();

  await db.schema
    .createTable("part_variation_relation")
    .addColumn("parent_part_variation_id", "text", (col) =>
      col.notNull().references("part_variation.id").onDelete("cascade"),
    )
    .addColumn("child_part_variation_id", "text", (col) =>
      col.notNull().references("part_variation.id").onDelete("restrict"),
    )
    .addColumn("count", "integer", (col) => col.notNull().check(sql`count > 0`))
    .addPrimaryKeyConstraint("part_variation_relation_pk", [
      "parent_part_variation_id",
      "child_part_variation_id",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("part_variation_relation").execute();
  await db.schema.dropTable("part_variation").execute();
}
