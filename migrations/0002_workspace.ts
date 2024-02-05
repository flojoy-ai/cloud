import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
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
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("workspace").execute();
  await db.schema.dropType("plan").execute();
}
