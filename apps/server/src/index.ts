import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { UserRoute } from "./routes/user";
import { AuthRoute } from "./routes/auth";
import { workspaceRoute as WorkspaceRoute } from "./routes/workspace";
import { AuthGoogleRoute } from "./routes/auth/google";
import { cors } from "@elysiajs/cors";
import { SearchRoute } from "./routes/search";
import { logger } from "@bogeychan/elysia-logger";
import { env } from "./env";
import { ProjectRoute } from "./routes/project";

const app = new Elysia()
  .use(
    logger({
      level: env.NODE_ENV === "production" ? "error" : "info",
      autoLogging: true,
    }),
  )
  .use(swagger())
  .use(
    // NOTE: https://github.com/elysiajs/elysia-cors/issues/41
    cors({
      origin: "localhost:5173", // FIXME: Switch this in .env
      allowedHeaders: "Content-Type",
    }),
  )
  .use(UserRoute)
  .use(AuthRoute)
  .use(AuthGoogleRoute)
  .use(WorkspaceRoute)
  .use(ProjectRoute)
  .use(SearchRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
