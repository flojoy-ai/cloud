import { generateOpenApiDocument } from "trpc-openapi";

import { appRouter } from "./root";
import { env } from "~/env";

/* 👇 */
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Flojoy Cloud API",
  version: "1.0.0",
  baseUrl:
    env.NODE_ENV === "production"
      ? "https://cloud.flojoy.ai/api"
      : "http://localhost:3000/api",
});
