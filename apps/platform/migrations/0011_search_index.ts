import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE INDEX IF NOT EXISTS gin_model_name_index ON model USING GIN (name gin_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS gin_project_name_index ON project USING GIN (name gin_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS gin_hardware_name_index ON hardware USING GIN (name gin_trgm_ops)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("gin_model_name_index").ifExists().execute();
  await db.schema.dropIndex("gin_project_name_index").ifExists().execute();
  await db.schema.dropIndex("gin_hardware_name_index").ifExists().execute();
}
