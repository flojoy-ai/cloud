import { env } from "../env";

import { CamelCasePlugin, Dialect, Kysely, PostgresDialect } from "kysely";
import { Pool, types } from "pg";
import { MysqlDialect } from "kysely";
import { createPool } from "mysql2/promise";
import { DB } from "@cloud/shared";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { Mysql2Adapter } from "@lucia-auth/adapter-mysql";
import { Adapter } from "lucia";

const configureDb = () => {
  let dialect: Dialect;
  let luciaAdapter: Adapter;

  switch (env.DATABASE) {
    case "postgres": {
      const pool = new Pool({
        connectionString: env.DATABASE_URL,
      });
      dialect = new PostgresDialect({ pool });
      luciaAdapter = new NodePostgresAdapter(pool, {
        user: "user",
        session: "user_session",
      });
      break;
    }
    case "mysql": {
      const pool = createPool(env.DATABASE_URL);
      dialect = new MysqlDialect({ pool });
      luciaAdapter = new Mysql2Adapter(pool, {
        user: "user",
        session: "user_session",
      });
    }
  }

  return {
    dialect,
    luciaAdapter,
  };
};

const { dialect, luciaAdapter } = configureDb();
export { luciaAdapter };

// NOTE: Return bigint as number instead of string
// Might want to get rid of this in the future?
types.setTypeParser(20, (val) => parseInt(val, 10));
types.setTypeParser(1700, (val) => parseFloat(val));

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});

export type db = typeof db;
