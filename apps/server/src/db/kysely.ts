import { env } from "../env";

import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DB } from "@cloud/shared";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
});

export type db = typeof db;
