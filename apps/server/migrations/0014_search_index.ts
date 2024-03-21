import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE EXTENSION pg_trgm;`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS model_trgm_index ON model USING GIST (name gist_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS project_trgm_index ON project USING GIST (name gist_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS hardware_trgm_index ON hardware USING GIST (name gist_trgm_ops)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("model_trgm_index").ifExists().execute();
  await db.schema.dropIndex("project_trgm_index").ifExists().execute();
  await db.schema.dropIndex("hardware_trgm_index").ifExists().execute();
  await sql`DROP EXTENSION pg_trgm`.execute(db);
}
