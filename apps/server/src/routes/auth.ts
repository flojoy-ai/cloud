import { lucia } from "../auth/lucia";
import { env } from "../env";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthMethod } from "../types/auth";
import { Elysia } from "elysia";

export const AuthRoute = new Elysia({ prefix: "/auth" })
  .get("/", async () => {
    const availableMethods: AuthMethod[] = [];
    if (env.GOOGLE_CLIENT_ID) {
      availableMethods.push("google");
    }
    if (env.ENTRA_CLIENT_ID) {
      availableMethods.push("entra");
    }
    return availableMethods;
  })
  .use(AuthMiddleware)
  .get("/logout", async ({ set, session, cookie }) => {
    // make sure to invalidate the current session!
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    cookie[sessionCookie.name]?.set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });

    set.redirect = env.WEB_URL;
    return;
  });
