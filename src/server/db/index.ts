import { env } from "~/env";
import * as schema from "./schema";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import pg from "pg";
import postgres from "postgres";
const { Pool } = pg;

export const pool = env.AWS_AMI
  ? new Pool({ connectionString: env.DATABASE_URL })
  : new NeonPool({ connectionString: env.DATABASE_URL });
const sql = postgres(env.DATABASE_URL);
export const db = env.AWS_AMI
  ? drizzle(sql, { schema })
  : neonDrizzle(pool as NeonPool, { schema });
