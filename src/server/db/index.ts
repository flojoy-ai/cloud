import { env } from "~/env";
import * as schema from "./schema";
import { remember } from "@epic-web/remember";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export const client = remember("client", () => postgres(env.DATABASE_URL));

// remember creates a singleton to fix too many db connection err with HMR
export const db = remember("db", () => drizzle(client, { schema }));
