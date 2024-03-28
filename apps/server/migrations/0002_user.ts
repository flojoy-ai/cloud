import { type Kysely, sql } from "kysely";

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
    .addUniqueConstraint("user_email_unique", ["email"])
    .execute();

  await db.schema
    .createTable("user_session")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("user_id", "text", (col) =>
      col.references("user.id").onDelete("cascade").notNull(),
    )
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("oauth_account")
    .addColumn("provider_id", "text", (col) => col.notNull())
    .addColumn("provider_user_id", "text", (col) => col.notNull())
    .addColumn("user_id", "text", (col) =>
      col.references("user.id").onDelete("cascade").notNull(),
    )
    .addPrimaryKeyConstraint("oauth_account_pk", [
      "provider_id",
      "provider_user_id",
    ])
    .execute();

  await db.schema
    .createTable("password_reset_token")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("user_id", "text", (col) =>
      col.references("user.id").onDelete("cascade").notNull(),
    )
    .addColumn("token", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("email_verification")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("code", "text", (col) => col.notNull())
    .addColumn("user_id", "text", (col) =>
      col.references("user.id").onDelete("cascade").notNull(),
    )
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("expires_at", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createType("workspace_role")
    .asEnum(["owner", "admin", "member"])
    .execute();

  await db.schema
    .createTable("user_invite")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("workspace_id", "text", (col) =>
      col.references("workspace.id").onDelete("cascade").notNull(),
    )
    .addColumn("role", sql`workspace_role`, (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("workspace_user")
    .addColumn("user_id", "text", (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("workspace_id", "text", (col) =>
      col.references("workspace.id").onDelete("cascade").notNull(),
    )
    .addColumn("role", sql`workspace_role`, (col) => col.notNull())
    .addColumn("created_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addPrimaryKeyConstraint("workspace_user_pk", ["user_id", "workspace_id"])
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("password_reset_token").execute();
  await db.schema.dropTable("email_verification").execute();
  await db.schema.dropTable("user_session").execute();
  await db.schema.dropTable("oauth_account").execute();
  await db.schema.dropTable("user_invite").execute();
  await db.schema.dropTable("workspace_user").execute();
  await db.schema.dropTable("user").execute();
  await db.schema.dropType("workspace_role").execute();
}
