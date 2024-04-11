import { AuthMiddleware } from "../middlewares/auth";
import { Elysia } from "elysia";
import { WorkspaceMiddleware } from "../middlewares/workspace";

export const UserRoute = new Elysia({ prefix: "/user", name: "UserRoute" })
  .use(AuthMiddleware)
  .get("/", async ({ user }) => {
    return user;
  })
  .use(WorkspaceMiddleware)
  .get("/workspace", async ({ workspaceUser }) => {
    return workspaceUser;
  });
