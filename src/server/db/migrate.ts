import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres/driver";
import pg from "pg";
import { dbConfig } from "./index";

const { Client } = pg;
const sql = new Client(dbConfig);
const db = drizzle(sql);
(async function main() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
  } catch (error) {
    console.error("error migrating", error);
  }
})().catch((err) => console.error(err));
