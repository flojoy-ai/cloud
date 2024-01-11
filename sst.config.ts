import { type SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";
import { env } from "~/env";

export default {
  config(input) {
    return {
      name: "flojoy-cloud",
      region: "us-east-1",
      profile: input.stage === "production" ? "flojoy-prod" : "flojoy-dev",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site", {
        environment: {
          DATABASE_URL: env.DATABASE_URL,

          NODE_ENV: env.NODE_ENV,

          // VERCEL_BRANCH_URL: env.VERCEL_BRANCH_URL,

          GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
          GOOGLE_REDIRECT_URI: env.GOOGLE_REDIRECT_URI,

          // AWS_ACCESS_KEY_ID: z.string(),
          // AWS_SECRET_ACCESS_KEY: z.string(),
          // AWS_BUCKET_NAME: z.string(),
          // AWS_REGION: z.string(),

          JWT_SECRET: env.JWT_SECRET,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
