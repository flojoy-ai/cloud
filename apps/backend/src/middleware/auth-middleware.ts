import { Elysia, error } from "elysia";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";
import { lucia } from "~/routes/auth/lucia";

export const authMiddleware = new Elysia().derive(
  async (
    context
  ): Promise<{
    user: User;
    session: Session;
  }> => {
    // CSRF check
    if (context.request.method !== "GET") {
      const originHeader = context.request.headers.get("Origin");
      // NOTE: You may need to use `X-Forwarded-Host` instead
      const hostHeader = context.request.headers.get("Host");
      if (
        !originHeader ||
        !hostHeader ||
        !verifyRequestOrigin(originHeader, [hostHeader])
      ) {
        throw error("Unauthorized", null);
      }
    }

    // use headers instead of Cookie API to prevent type coercion
    const cookieHeader = context.request.headers.get("Cookie") ?? "";
    const sessionId = lucia.readSessionCookie(cookieHeader);
    if (!sessionId) {
      throw error("Unauthorized", null);
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (!user) {
      throw error("Unauthorized", null);
    }
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      context.cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      });
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      context.cookie[sessionCookie.name].set({
        value: sessionCookie.value,
        ...sessionCookie.attributes,
      });
    }
    return {
      user,
      session,
    };
  }
);
