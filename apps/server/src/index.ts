import swagger from "@elysiajs/swagger";
import { ELYSIA_RESPONSE, Elysia } from "elysia";
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
import { PartRoute } from "./routes/part";
import SuperJSON from "superjson";
import { ProductRoute } from "./routes/product";
import { PartVariationRoute } from "./routes/part-variation";
import { UnitRoute } from "./routes/unit";
import { StationRoute } from "./routes/station";
import { AuthEntraRoute } from "./routes/auth/entra";
import { SessionRoute } from "./routes/session";
import { SecretRoute } from "./routes/secret";

const encoder = new TextEncoder();

const app = new Elysia()
  .derive((ctx) => fixCtxRequest(ctx.request))
  .use(
    // NOTE: https://github.com/elysiajs/elysia-cors/issues/41
    cors({
      credentials: true,
      origin: [env.WEB_URI],
      allowedHeaders: [
        "content-type",
        "flojoy-workspace-id",
        "use-superjson",
        "superjson-meta",
        "flojoy-workspace-personal-secret",
      ],
      exposedHeaders: ["superjson-meta"],
    }),
  )
  .use(swagger())
  .mapResponse(({ request, response, set }) => {
    const isJson = typeof response === "object";
    if (!isJson) return response as Response;

    const wantSuperJson = request.headers.get("use-superjson") === "true";

    const { json, meta } = wantSuperJson
      ? SuperJSON.serialize(response)
      : { json: JSON.stringify(response), meta: undefined };

    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Encoding": "gzip",
    };
    if (meta) {
      headers["superjson-meta"] = JSON.stringify(meta);
    }

    return new Response(Bun.gzipSync(encoder.encode(JSON.stringify(json))), {
      headers,
      status:
        response !== null && ELYSIA_RESPONSE in response
          ? (response[ELYSIA_RESPONSE] as number)
          : (set.status as number),
    });
  })
  .use(
    logger({
      level: env.NODE_ENV === "production" ? "error" : "info",
      autoLogging: true,
    }),
  )
  .use(UserRoute)
  .use(AuthRoute)
  .use(AuthGoogleRoute)
  .use(AuthEntraRoute)
  .use(WorkspaceRoute)
  .use(SecretRoute)
  .use(ProjectRoute)
  .use(SearchRoute)
  .use(ProductRoute)
  .use(PartRoute)
  .use(PartVariationRoute)
  .use(StationRoute)
  .use(UnitRoute)
  .use(SessionRoute)
  .get("/health", () => ({ status: "200" }))
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
