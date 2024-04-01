import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE EXTENSION pg_trgm;`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS product_trgm_index ON product USING GIST (name gist_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS part_trgm_index ON part USING GIST (name gist_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS part_variation_trgm_index ON part_variation USING GIST (part_number gist_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS project_trgm_index ON project USING GIST (name gist_trgm_ops)`.execute(
    db,
  );
  await sql`CREATE INDEX IF NOT EXISTS hardware_trgm_index ON hardware USING GIST (serial_number gist_trgm_ops)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("product_trgm_index").ifExists().execute();
  await db.schema.dropIndex("part_trgm_index").ifExists().execute();
  await db.schema.dropIndex("part_variation_trgm_index").ifExists().execute();
  await db.schema.dropIndex("project_trgm_index").ifExists().execute();
  await db.schema.dropIndex("hardware_trgm_index").ifExists().execute();
  await sql`DROP EXTENSION pg_trgm`.execute(db);
}
