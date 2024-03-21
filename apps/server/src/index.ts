import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { userRoute } from "./routes/user";
import { authRoute } from "./routes/auth";
import { workspacesRoute } from "./routes/workspaces";
import { authGoogleRoute } from "./routes/auth/google";

const app = new Elysia()
  .use(swagger())
  .use(userRoute)
  .use(authRoute)
  .use(authGoogleRoute)
  .use(workspacesRoute)
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
