import { Elysia } from "elysia";
import { authMiddleware } from "~/middleware/auth-middleware";

export const userRoute = new Elysia({ prefix: "/user" })
  .use(authMiddleware)
  .get("/", async ({ user }) => {
    return user;
  });
