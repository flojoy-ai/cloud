import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { userRoute } from "./routes/user";
import { workspacesRoute } from "./routes/workspaces";
import { authRouter } from "./routes/auth/index";

const app = new Elysia()
  .use(swagger())
  .get("/", () => "Elysia server is up and running!")
  .use(userRoute)
  .use(authRouter)
  .use(workspacesRoute)
  .onError(({ code, path, request }) => {
    if (code === "NOT_FOUND") {
      return `${request.method} request to "${path}" not found :(`;
    }
  })
  .listen(3008);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
