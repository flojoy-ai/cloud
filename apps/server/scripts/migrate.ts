import * as path from "path";
import { promises as fs } from "fs";
import { Migrator, FileMigrationProvider } from "kysely";
import { env } from "@/env";

import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type Database from "@/schemas/Database";

async function migrate() {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
  });

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  const migrationFolder = path.join(path.resolve(), "migrations");

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder,
    }),
  });
  console.log(`Running migrations from ${migrationFolder}`);

  const args = process.argv.slice(2);
  let res;
  switch (args.shift()) {
    case "--up": {
      console.log("Migrating up...");
      res = await migrator.migrateUp();
      break;
    }
    case "--down": {
      console.log("Migrating down...");
      res = await migrator.migrateDown();
      break;
    }
    case "--to-latest": {
      console.log("Migrating to latest...");
      res = await migrator.migrateToLatest();
      break;
    }
    case "--to": {
      const migrationName = args.shift();
      if (migrationName === undefined) {
        console.log("Missing migration name to migrate to");
        process.exit(1);
      }

      console.log(`Migrating to ${migrationName}...`);

      res = await migrator.migrateTo(migrationName);
      break;
    }
    default:
      console.log(
        "Missing argument, specify either --up, --down, --to-latest, or --to",
      );
      process.exit(1);
  }

  const { error, results } = res;

  results?.forEach((it) => {
    if (it.status === "Success") {
      // eslint-disable-next-line no-console
      console.log(
        `migration ${it.direction.toLowerCase()} "${it.migrationName}" was executed successfully`,
      );
    } else if (it.status === "Error") {
      console.error(
        `failed to execute migration ${it.direction.toLowerCase()} "${it.migrationName}"`,
      );
    }
  });

  if (error) {
    console.error("failed to execute migration");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrate();
