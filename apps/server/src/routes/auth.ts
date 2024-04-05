import { lucia } from "../auth/lucia";
import { env } from "../env";
import { getUrlFromUri } from "../lib/url";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthMethod } from "@cloud/shared";
import { Elysia } from "elysia";

export const AuthRoute = new Elysia({ prefix: "/auth", name: "AuthRoute" })
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
  .get("/logout", async ({ set, session, cookie, authMethod, error }) => {
    if (authMethod === "secret") {
      return error("I'm a teapot");
    }
    // make sure to invalidate the current session!
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    cookie[sessionCookie.name]?.set({
      value: sessionCookie.value,
      ...sessionCookie.attributes,
    });

    set.redirect = getUrlFromUri(env.WEB_URI);
    return;
  });
