import { lucia } from "@/auth/lucia";
import { AuthMiddleware } from "@/middlewares/auth";
import { Elysia } from "elysia";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(AuthMiddleware)

  .get("/logout", async ({ set, session }) => {
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
  });
