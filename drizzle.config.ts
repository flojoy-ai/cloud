import { type Config } from "drizzle-kit";
import { dbConfig } from "~/server/db";

export default {
  schema: "./src/server/db/schema/*.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: dbConfig,
  tablesFilter: ["cloud_*"],
} satisfies Config;
