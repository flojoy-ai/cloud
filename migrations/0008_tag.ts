import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("tag")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("measurement_id", "text", (col) =>
      col.notNull().references("measurement.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("tag_name_measurement_id_unique", [
      "name",
      "measurement_id",
    ])
    .execute();

  await db.schema
    .createIndex("tag_name_measurement_id_index")
    .ifNotExists()
    .on("measurement")
    .column("name")
    .column("measurement_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("tag").execute();
}
