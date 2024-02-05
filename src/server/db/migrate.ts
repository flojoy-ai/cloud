import { type Kysely, sql } from "kysely";
import { allMeasurementDataTypes } from "~/types/data";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("email_verified", "boolean", (col) => col.defaultTo(false))
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("hashed_password", "text")
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  // Workspace table

  await db.schema
    .createType("plan")
    .asEnum(["hobby", "pro", "enterprise"])
    .execute();

  await db.schema
    .createTable("workspace")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("namespace", "text", (col) => col.notNull().unique())
    .addColumn("plan_type", sql`plan`, (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();

  await db.schema
    .createIndex("workspace_namespace_index")
    .ifNotExists()
    .on("workspace")
    .column("namespace")
    .execute();

  // Test table
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
  await db.schema.dropTable("user").execute();
}
