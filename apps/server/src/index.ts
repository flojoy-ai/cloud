import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { userRoute } from "./routes/user";
import { authRoute } from "./routes/auth";
import { workspaceRoute as workspaceRoute } from "./routes/workspace";
import { authGoogleRoute } from "./routes/auth/google";
import { cors } from "@elysiajs/cors";
import { searchRoute } from "./routes/search";
import { logger } from "@bogeychan/elysia-logger";
import { env } from "./env";

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
  .use(userRoute)
  .use(authRoute)
  .use(authGoogleRoute)
  .use(workspaceRoute)
  .use(searchRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
