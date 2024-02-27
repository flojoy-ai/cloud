import { lucia } from "~/routes/auth/lucia";
import { Elysia } from "elysia";
import { authMiddleware } from "~/middleware/auth-middleware";
import { frontendUrl } from "~/lib/utils";

export const logoutRoute = new Elysia({ prefix: "/logout" })
  .use(authMiddleware)
  .get("/", async ({ session, set }) => {
    if (!session) {
      set.status = "Unauthorized";
      return;
    }

    // make sure to invalidate the current session!
    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();

    set.cookie = {
      [sessionCookie.name]: {
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      },
    };

    set.status = "Permanent Redirect";
    set.redirect = frontendUrl("/");
    return null;
  });
