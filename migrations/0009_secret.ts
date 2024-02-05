import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("secret")
    .addColumn("id", "text", (col) => col.notNull())
    .addColumn("user_id", "text", (col) =>
      col.references("user.id").onDelete("cascade").notNull(),
    )
    .addColumn("value", "text", (col) => col.notNull())
    .addColumn("workspace_id", "text", (col) =>
      col.references("workspace.id").onDelete("cascade").notNull(),
    )
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("last_used_at", "timestamp")
    .addUniqueConstraint("secret_workspace_id_user_id_unique", [
      "workspace_id",
      "user_id",
    ])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("secret").execute();
}
