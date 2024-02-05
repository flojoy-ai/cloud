import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("model")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("model_workspace_id_name_unique", [
      "workspace_id",
      "name",
    ])
    .execute();

  await db.schema
    .createIndex("model_name_index")
    .ifNotExists()
    .on("model")
    .column("name")
    .execute();

  await db.schema
    .createTable("parent_child_model")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("parent_model_id", "text", (col) =>
      col.notNull().references("model.id").onDelete("cascade"),
    )
    .addColumn("child_model_id", "text", (col) =>
      col.notNull().references("model.id").onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("model").execute();
}
