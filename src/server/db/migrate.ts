import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js/driver";
import { migrate as neonMigrate } from "drizzle-orm/neon-http/migrator";
import { neon } from "@neondatabase/serverless";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-http/driver";
import { env } from "~/env";
import postgres from "postgres";

if (env.AWS_AMI === 1) {
  const pg = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(pg);
  await migrate(db, { migrationsFolder: "./drizzle" });

  // Don't forget to close the connection, otherwise the script will hang
  await pg.end();
} else {
  const sql = neon(env.DATABASE_URL);
  const db = neonDrizzle(sql);
  await neonMigrate(db, { migrationsFolder: "./drizzle" });
}
