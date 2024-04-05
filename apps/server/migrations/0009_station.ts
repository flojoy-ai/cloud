import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("station")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade"),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("station_project_id_name_unique", [
      "project_id",
      "name",
    ])
    .execute();

  await db.schema
    .createIndex("station_name_index")
    .on("station")
    .column("name")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("station").execute();
}
