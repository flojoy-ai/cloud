import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("project")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("workspace_id", "text", (col) =>
      col.notNull().references("workspace.id").onDelete("cascade"),
    )
    .addColumn("part_variation_id", "text", (col) =>
      col.notNull().references("part_variation.id").onDelete("restrict"),
    )
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("updated_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("repo_url", "text")
    .addUniqueConstraint("project_workspace_id_name_unique", [
      "workspace_id",
      "name",
    ])
    .execute();

  await db.schema
    .createIndex("project_name_index")
    .on("project")
    .column("name")
    .execute();

  await db.schema
    .createType("project_role")
    .asEnum(["test", "dev", "pending"])
    .execute();

  await db.schema
    .createTable("project_user")
    .addColumn("user_id", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("workspace_id", "text", (col) =>
      col.references("workspace.id").onDelete("cascade").notNull(),
    )
    .addColumn("project_id", "text", (col) =>
      col.references("project.id").onDelete("cascade").notNull(),
    )
    .addColumn("role", sql`project_role`, (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addPrimaryKeyConstraint("project_user_pk", ["user_id", "project_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("project_user").execute();
  await db.schema.dropTable("project").execute();
  await db.schema.dropType("project_role").execute();
}
