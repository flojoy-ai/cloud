import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("storage_provider")
    .asEnum(["s3", "postgres"])
    .execute();

  await db.schema
    .createTable("measurement")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("data", "jsonb", (col) => col.notNull())
    .addColumn("pass", "boolean")
    .addColumn("unit_id", "text", (col) =>
      col.notNull().references("unit.id").onDelete("cascade"),
    )
    .addColumn("test_id", "text", (col) =>
      col.notNull().references("test.id").onDelete("cascade"),
    )
    .addColumn("session_id", "text", (col) =>
      col.references("session.id").onDelete("cascade"),
    )
    .addColumn("sequence_name", "text")
    .addColumn("cycle_number", "integer")
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade"),
    )
    .addColumn("storage_provider", sql`storage_provider`, (col) =>
      col.notNull(),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("duration_ms", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("is_deleted", "boolean", (col) => col.defaultTo(false))
    .execute();

  await db.schema
    .createIndex("measurement_name_index")
    .ifNotExists()
    .on("measurement")
    .column("name")
    .execute();

  await db.schema
    .createIndex("measurement_unit_id_index")
    .ifNotExists()
    .on("measurement")
    .column("unit_id")
    .execute();

  await db.schema
    .createIndex("measurement_test_id_index")
    .ifNotExists()
    .on("measurement")
    .column("test_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("measurement").execute();
  await db.schema.dropType("storage_provider").execute();
}
