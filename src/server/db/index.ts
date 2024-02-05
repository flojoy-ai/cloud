import { env } from "~/env";

import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import Database from "~/schemas/Database";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});
