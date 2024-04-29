import { env } from "../env";

import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";
import { DB } from "@cloud/shared";

export const pool = new Pool({
  connectionString:
    env.DATABASE_URL + env.NODE_ENV === "production" ? "?sslmode=require" : "",
});

// NOTE: Return bigint as number instead of string
// Might want to get rid of this in the future?
types.setTypeParser(20, (val) => parseInt(val, 10));
types.setTypeParser(1700, (val) => parseFloat(val));

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
});

export type db = typeof db;
