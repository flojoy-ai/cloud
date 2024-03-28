import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { fixCtxRequest } from "./lib/fix";
import { UserRoute } from "./routes/user";
import { AuthRoute } from "./routes/auth";
import { WorkspaceRoute } from "./routes/workspace";
import { AuthGoogleRoute } from "./routes/auth/google";
import { cors } from "@elysiajs/cors";
import { SearchRoute } from "./routes/search";
import { logger } from "@bogeychan/elysia-logger";
import { env } from "./env";
import { ProjectRoute } from "./routes/project";
import { FamilyRoute } from "./routes/family";
import SuperJSON from "superjson";
import { ProductRoute } from "./routes/product";
import { ModelRoute } from "./routes/model";
import { HardwareRoute } from "./routes/hardware";
import { StationRoute } from "./routes/station";
import { AuthEntraRoute } from "./routes/auth/entra";
import { SessionRoute } from "./routes/session";
import { getUrlFromUri } from "./lib/url";

const encoder = new TextEncoder();

const app = new Elysia()
  .derive((ctx) => fixCtxRequest(ctx.request))
  .mapResponse(({ request, response, set }) => {
    const isJson = typeof response === "object";

    const text = isJson
      ? request.headers.get("use-superjson") === "true"
        ? SuperJSON.stringify(response)
        : JSON.stringify(response)
      : response?.toString() ?? "";

    set.headers["Content-Encoding"] = "gzip";

    return new Response(Bun.gzipSync(encoder.encode(text)), {
      headers: {
        "Content-Type": `${
          isJson ? "application/json" : "text/plain"
        }; charset=utf-8`,
      },
    });
  })
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
      credentials: true,
      origin: [getUrlFromUri(env.WEB_URI)],
      allowedHeaders: ["content-type", "flojoy-workspace-id", "use-superjson"],
    }),
  )
  .use(UserRoute)
  .use(AuthRoute)
  .use(AuthGoogleRoute)
  .use(AuthEntraRoute)
  .use(WorkspaceRoute)
  .use(ProjectRoute)
  .use(SearchRoute)
  .use(ProductRoute)
  .use(FamilyRoute)
  .use(ModelRoute)
  .use(StationRoute)
  .use(HardwareRoute)
  .use(SessionRoute)
  .get("/health", () => ({ status: "200" }))
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
