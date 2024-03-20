import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { userRoute } from "./routes/user";
import { authRoute } from "./routes/auth";
import { workspacesRoute } from "./routes/workspaces";

const app = new Elysia()
  .use(swagger())
  .use(userRoute)
  .use(authRoute)
  .use(workspacesRoute)
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
