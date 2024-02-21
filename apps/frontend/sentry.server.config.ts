// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { env } from "~/env";

if (env.NODE_ENV === "production") {
  Sentry.init({
    dsn: "https://11e5ec379ac80034bffdefcd3b8555cd@o4504914175131648.ingest.sentry.io/4506775599251456",

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
