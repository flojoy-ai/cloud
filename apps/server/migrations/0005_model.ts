import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("model")
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("family_id", "text", (col) =>
      col.notNull().references("family.id").onDelete("cascade"),
    )
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("description", "text")
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
    .on("model")
    .column("name")
    .execute();

  await db.schema
    .createTable("model_relation")
    .addColumn("parent_model_id", "text", (col) =>
      col.notNull().references("model.id").onDelete("cascade"),
    )
    .addColumn("child_model_id", "text", (col) =>
      col.notNull().references("model.id").onDelete("restrict"),
    )
    .addColumn("count", "integer", (col) => col.notNull().check(sql`count > 0`))
    .addPrimaryKeyConstraint("model_relation_pk", [
      "parent_model_id",
      "child_model_id",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("model_relation").execute();
  await db.schema.dropTable("model").execute();
}
