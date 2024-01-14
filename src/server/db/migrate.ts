import { migrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http/driver";
import { env } from "~/env";

const sql = neon(env.DATABASE_URL);
const db = drizzle(sql);
await migrate(db, { migrationsFolder: "./drizzle" });
