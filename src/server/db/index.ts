import { env } from "~/env";
import * as schema from "./schema";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

export const pool = new Pool({ connectionString: env.DATABASE_URL });

// remember creates a singleton to fix too many db connection err with HMR
export const db = drizzle(pool, { schema });
