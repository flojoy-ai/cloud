import { lucia } from "@/auth/lucia";
import { env } from "@/env";
import { AuthMiddleware } from "@/middlewares/auth";
import { Elysia } from "elysia";

export const authRoute = new Elysia({ prefix: "/auth" })
  .use(AuthMiddleware)
  .get("/logout", async ({ set, session, cookie }) => {
    // make sure to invalidate the current session!
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    cookie[sessionCookie.name]?.set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });

    // FIXME: Redirect doesn't work
    set.redirect = env.WEB_URL;
  });
