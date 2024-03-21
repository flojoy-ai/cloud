import { AuthMiddleware } from "@/middlewares/auth";
import { Elysia } from "elysia";

export const userRoute = new Elysia({ prefix: "/user" })
  .use(AuthMiddleware)
  .get("/", async ({ user }) => {
    console.log(user);
    return user;
  });
