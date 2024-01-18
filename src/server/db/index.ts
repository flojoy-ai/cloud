import { env } from "~/env";
import * as schema from "./schema";

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
export const dbConfig = {
  host: "127.0.0.1",
  port: 5432,
  user: "flojoy",
  password: env.LOCAL_POSTGRES_PASS ?? process.env.LOCAL_POSTGRES_PASS,
  database: "flojoy_cloud",
};
export const pool = new Pool(dbConfig);

export const db = drizzle(pool, { schema });
