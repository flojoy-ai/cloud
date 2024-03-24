import { AuthMiddleware } from "@/middlewares/auth";
import { Elysia } from "elysia";

export const UserRoute = new Elysia({ prefix: "/user" })
  .use(AuthMiddleware)
  .get("/", async ({ user }) => {
    return user;
  });
