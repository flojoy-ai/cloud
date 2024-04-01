import { type Kysely, sql } from "kysely";
import { allMeasurementDataTypes } from "@cloud/shared";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("measurement_type")
    .asEnum([...allMeasurementDataTypes])
    .execute();

  await db.schema
    .createTable("test")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("measurement_type", sql`measurement_type`, (col) =>
      col.notNull(),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("project_id", "text", (col) =>
      col.notNull().references("project.id").onDelete("cascade"),
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
    .on("test")
    .column("name")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("test").execute();
  await db.schema.dropType("measurement_type").execute();
}
