import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("unit")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("part_variation_id", "text", (col) =>
      col.notNull().references("part_variation.id").onDelete("restrict"),
    )
    .addColumn("serial_number", "text", (col) => col.notNull())
    .addColumn("lot_number", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("unit_serial_number_part_variation_id_unique", [
      "serial_number",
      "part_variation_id",
    ])
    .execute();

  await db.schema
    .createIndex("unit_serial_number_index")
    .on("unit")
    .column("serial_number")
    .execute();

  await db.schema
    .createTable("unit_relation")
    .addColumn("parent_unit_id", "text", (col) =>
      col.notNull().references("unit.id").onDelete("cascade"),
    )
    .addColumn("child_unit_id", "text", (col) =>
      col.notNull().references("unit.id").onDelete("restrict"),
    )
    .addPrimaryKeyConstraint("unit_relation_pk", [
      "parent_unit_id",
      "child_unit_id",
    ])
    .execute();

  await db.schema
    .createTable("project_unit")
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade"),
    )
    .addColumn("unit_id", "text", (col) =>
      col.notNull().references("unit.id").onDelete("cascade"),
    )
    .addPrimaryKeyConstraint("project_unit_pk", ["project_id", "unit_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("unit_relation").execute();
  await db.schema.dropTable("project_unit").execute();
  await db.schema.dropTable("unit").execute();
}
