import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await sql`CREATE INDEX gin_model_name_index ON model USING GIN (name gin_trgm_ops)`.execute(
    db,
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  db.schema.dropIndex("gin_model_name_index");
}
