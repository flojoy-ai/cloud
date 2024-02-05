import { type Kysely, sql } from "kysely";
import { allMeasurementDataTypes } from "~/types/data";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("measurement_type")
    .asEnum([...allMeasurementDataTypes])
    .execute();

  await db.schema
    .createTable("test")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint("test_project_id_name_unique", ["project_id", "name"])
    .execute();

  await db.schema
    .createIndex("test_name_index")
    .ifNotExists()
    .on("test")
    .column("name")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("test").execute();
  await db.schema.dropType("measurement_type").execute();
}
