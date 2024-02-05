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
      col.notNull().references("model.id").onDelete("restrict"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("hardware_name_model_id_unique", ["name", "model_id"])
    .execute();

  await db.schema
    .createIndex("hardware_name_index")
    .on("hardware")
    .column("name")
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
  await db.schema.dropTable("hardware").execute();
  await db.schema.dropTable("hardware_relation").execute();
  await db.schema.dropTable("project_hardware").execute();
}
