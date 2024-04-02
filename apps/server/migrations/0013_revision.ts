import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createType("revision_type")
    .asEnum(["init", "remove", "add"])
    .execute();

  await db.schema
    .createTable("unit_revision")
    .addColumn("unit_id", "text", (col) =>
      col.references("unit.id").onDelete("cascade").notNull(),
    ) // this is the unit that you are doing the revision on
    .addColumn("revision_type", sql`revision_type`, (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn("component_id", "text", (col) =>
      col.references("unit.id").onDelete("cascade").notNull(),
    ) // this is the component that you initialized/added/removed.
    .addColumn("reason", "text", (col) => col)
    .addColumn("user_id", "text", (col) => col.references("user.id").notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("unit_revision").execute();
  await db.schema.dropType("revision_type").execute();
}
