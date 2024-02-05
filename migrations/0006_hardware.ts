import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("hardware")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("model_id", "text", (col) =>
      col.notNull().references("model.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("hardware_workspace_id_name_model_id_unique", [
      "workspace_id",
      "name",
      "model_id",
    ])
    .execute();

  await db.schema
    .createIndex("hardware_name_index")
    .ifNotExists()
    .on("hardware")
    .column("name")
    .execute();

  await db.schema
    .createTable("parent_child_hardware")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("parent_hardware_id", "text", (col) =>
      col.notNull().references("hardware.id").onDelete("cascade"),
    )
    .addColumn("child_hardware_id", "text", (col) =>
      col.notNull().references("hardware.id").onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("hardware").execute();
  await db.schema.dropTable("parent_child_hardware").execute();
}
