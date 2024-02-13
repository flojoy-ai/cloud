import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("hardware_revision")
    .addColumn("old_hardware_id", "text", (col) =>
      col.references("hardware.id").onDelete("cascade").notNull(),
    )
    .addColumn("new_hardware_id", "text", (col) =>
      col.references("hardware.id").onDelete("cascade").notNull(),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addPrimaryKeyConstraint("revision_pk", [
      "old_hardware_id",
      "new_hardware_id",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("hardware_revision").execute();
}
