import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  server: {
    WEB_URL: z.string().url().default("http://localhost:5173"),
    DATABASE_URL: z.string().url(),
    // Joey: looks like NODE_ENV is still supported for Bun
    // https://github.com/oven-sh/bun/commit/c006a7f054fdf19bad5b0783af3305e36f9e3740
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string().url(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: Bun.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
});
