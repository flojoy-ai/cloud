import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { userRoute } from "./routes/user";
import { authRoute } from "./routes/auth";
import { workspacesRoute } from "./routes/workspaces";
import { authGoogleRoute } from "./routes/auth/google";
import { cors } from "@elysiajs/cors";
import { searchRoute } from "./routes/search";

const app = new Elysia()
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
  .use(workspacesRoute)
  .use(searchRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
