import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("session")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("unit_id", "text", (col) =>
      col.notNull().references("unit.id").onDelete("cascade"),
    )
    .addColumn("user_id", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade"),
    )
    .addColumn("station_id", "text", (col) =>
      col.notNull().references("station.id").onDelete("cascade"),
    )
    .addColumn("commit_hash", "text")
    .addColumn("integrity", "boolean", (col) => col.notNull())
    .addColumn("aborted", "boolean", (col) => col.notNull())
    .addColumn("notes", "text", (col) => col)
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("session").execute();
}
