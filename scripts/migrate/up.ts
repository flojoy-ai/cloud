import * as path from "path";
import { promises as fs } from "fs";
import { Migrator, FileMigrationProvider } from "kysely";
import { env } from "~/env";

import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type Database from "~/schemas/Database";

async function migrateUp() {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
  });

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(path.resolve(), "migrations"),
    }),
  });

  const { error, results } = await migrator.migrateUp();

  results?.forEach((it) => {
    if (it.status === "Success") {
      // eslint-disable-next-line no-console
      console.log(
        `migration up "${it.migrationName}" was executed successfully`,
      );
    } else if (it.status === "Error") {
      console.error(`failed to execute migration up "${it.migrationName}"`);
    }
  });

  if (error) {
    console.error("failed to migrate up");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateUp();
