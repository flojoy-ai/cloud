import { type Kysely, sql } from "kysely";

// NOTE: Joey: https://brandur.org/fragments/deleted-record-insert

const tables = [
  "email_verification",
  "measurement",
  "measurement_tag",
  "oauth_account",
  "part",
  "part_variation",
  "part_variation_market",
  "part_variation_relation",
  "part_variation_type",
  "password_reset_token",
  "product",
  "project",
  "project_unit",
  "project_user",
  "session",
  "station",
  "tag",
  "test",
  "unit",
  "unit_revision",
  "user",
  "user_invite",
  "workspace",
  "workspace_user",
];

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("deleted_record")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("data", "jsonb")
    .addColumn("deleted_at", "timestamptz", (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn("table_name", "text")
    .execute();

  await sql`
CREATE FUNCTION deleted_record_insert() RETURNS trigger
    LANGUAGE plpgsql
AS $$
    BEGIN
        EXECUTE 'INSERT INTO deleted_record (data, table_name) VALUES ($1, $2)'
        USING to_jsonb(OLD.*), TG_TABLE_NAME;

        RETURN OLD;
    END;
$$;
`.execute(db);

  for (const table of tables) {
    await sql`
CREATE TRIGGER deleted_record_insert AFTER DELETE ON ${sql.table(table)}
    FOR EACH ROW EXECUTE FUNCTION deleted_record_insert();
`.execute(db);
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  for (const table of tables) {
    await sql`DROP TRIGGER deleted_record_insert ON ${sql.table(table)}`.execute(
      db,
    );
  }
  await sql`DROP FUNCTION deleted_record_insert`.execute(db);
}
