import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("tag")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("tag_name_workspace_id_unique", [
      "name",
      "workspace_id",
    ])
    .execute();

  await db.schema
    .createIndex("tag_name_measurement_id_index")
    .ifNotExists()
    .on("tag")
    .column("name")
    .execute();

  await db.schema
    .createTable("measurement_tag")
    .addColumn("measurement_id", "text", (col) =>
      col.notNull().references("measurement.id").onDelete("cascade"),
    )
    .addColumn("tag_id", "text", (col) =>
      col.notNull().references("tag.id").onDelete("restrict"),
    )
    .addPrimaryKeyConstraint("measurement_tag_pk", ["measurement_id", "tag_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("measurement_tag").execute();
  await db.schema.dropTable("tag").execute();
}
