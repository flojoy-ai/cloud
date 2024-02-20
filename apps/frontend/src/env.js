import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .transform((s) => (s += "?sslmode=require")),

    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // AUTH0_CLIENT_ID: z.string(),
    // AUTH0_CLIENT_SECRET: z.string(),
    // AUTH0_REDIRECT_URI: z.string().url().optional(),
    // AUTH0_APP_DOMAIN: z.string().url(),

    // VERCEL_BRANCH_URL: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string().url(),

    // these 2 are NOT optional for public cloud deployment
    // since those are only set automaticlaly on AWS AMI
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),

    AWS_REGION: z.string(),
    SENDER_EMAIL: z.string().email(),

    JWT_SECRET: z.string(),

    ZAPIER_CLIENT_ID: z.string().optional(),
    ZAPIER_CLIENT_SECRET: z.string().optional(),
    // HIGHLIGHT_PROJECT_ID: z.string().default("6gl9mxzg"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // We're using nginx to reverse proxy and running app on localhost for AWS AMI
    // As a result we need to set origin explicitly from env
    NEXT_PUBLIC_URL_ORIGIN: z.string().url().default("http://localhost:3000"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    // AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    // AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    // AUTH0_REDIRECT_URI: process.env.AUTH0_REDIRECT_URI,
    // AUTH0_APP_DOMAIN: process.env.AUTH0_APP_DOMAIN,

    // VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    // AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    SENDER_EMAIL: process.env.SENDER_EMAIL,

    JWT_SECRET: process.env.JWT_SECRET,
    NEXT_PUBLIC_URL_ORIGIN: process.env.NEXT_PUBLIC_URL_ORIGIN,

    ZAPIER_CLIENT_ID: process.env.ZAPIER_CLIENT_ID,
    ZAPIER_CLIENT_SECRET: process.env.ZAPIER_CLIENT_SECRET,
    // HIGHLIGHT_PROJECT_ID: process.env.HIGHLIGHT_PROJECT_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
