import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("hardware")
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
    .addUniqueConstraint("hardware_serial_number_part_variation_id_unique", [
      "serial_number",
      "part_variation_id",
    ])
    .execute();

  await db.schema
    .createIndex("hardware_serial_number_index")
    .on("hardware")
    .column("serial_number")
    .execute();

  await db.schema
    .createTable("hardware_relation")
    .addColumn("parent_hardware_id", "text", (col) =>
      col.notNull().references("hardware.id").onDelete("cascade"),
    )
    .addColumn("child_hardware_id", "text", (col) =>
      col.notNull().references("hardware.id").onDelete("restrict"),
    )
    .addPrimaryKeyConstraint("hardware_relation_pk", [
      "parent_hardware_id",
      "child_hardware_id",
    ])
    .execute();

  await db.schema
    .createTable("project_hardware")
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade"),
    )
    .addColumn("hardware_id", "text", (col) =>
      col.notNull().references("hardware.id").onDelete("cascade"),
    )
    .addPrimaryKeyConstraint("project_hardware_pk", [
      "project_id",
      "hardware_id",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("hardware_relation").execute();
  await db.schema.dropTable("project_hardware").execute();
  await db.schema.dropTable("hardware").execute();
}
