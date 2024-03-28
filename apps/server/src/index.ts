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
// import SuperJSON from "superjson";
// import { ELYSIA_RESPONSE } from "elysia";
import { ProductRoute } from "./routes/product";
import { ModelRoute } from "./routes/model";
import { HardwareRoute } from "./routes/hardware";
import { StationRoute } from "./routes/station";
import { AuthEntraRoute } from "./routes/auth/entra";
import { SessionRoute } from "./routes/session";
import { getUrlFromUri } from "./lib/url";

const app = new Elysia()
  .derive((ctx) => fixCtxRequest(ctx.request))
  // .mapResponse(({ response, set }) => {
  //   // FIXME: this disgusting mess
  //   // this exists so that we get superjson but also the proper status code
  //   // when using the error() function in the routes
  //   // console.log("response", response);
  //   if (
  //     typeof response === "object" &&
  //     response !== null &&
  //     ELYSIA_RESPONSE in response
  //   ) {
  //     return response as unknown as Response;
  //   }
  //   if (response)
  //     return new Response(SuperJSON.stringify(response), {
  //       status:
  //         typeof response === "object" &&
  //         response !== null &&
  //         "status" in response
  //           ? (response.status as number)
  //           : (set.status as number),
  //     });
  // })
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
      allowedHeaders: ["content-type", "flojoy-workspace-id"],
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
