import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`ALTER TABLE model ADD COLUMN ts tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED`.execute(
    db,
  );
  await sql`ALTER TABLE project ADD COLUMN ts tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED`.execute(
    db,
  );
  await sql`ALTER TABLE hardware ADD COLUMN ts tsvector GENERATED ALWAYS AS (to_tsvector('english', name)) STORED`.execute(
    db,
  );

  await sql`CREATE INDEX ts_idx_model ON model USING GIN (ts)`.execute(db);
  await sql`CREATE INDEX ts_idx_project ON project USING GIN (ts)`.execute(db);
  await sql`CREATE INDEX ts_idx_hardware ON hardware USING GIN (ts)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex("gin_model_name_index").ifExists().execute();
  await db.schema.dropIndex("gin_project_name_index").ifExists().execute();
  await db.schema.dropIndex("gin_hardware_name_index").ifExists().execute();
}
