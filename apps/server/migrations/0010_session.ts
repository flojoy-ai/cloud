import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("session")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("hardware_id", "text", (col) =>
      col.notNull().references("hardware.id").onDelete("cascade"),
    )
    .addColumn(
      "user_id",
      "text",
      // TODO: Should this be nullable or not?
      (col) => col.references("user.id").onDelete("cascade"),
    )
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade"),
    )
    .addColumn("station_id", "text", (col) =>
      col.notNull().references("station.id").onDelete("cascade"),
    )
    .addColumn("commit_hash", "text")
    .addColumn("notes", "text", (col) => col)
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("session").execute();
}
