import { lucia } from "@/auth/lucia";
import { Elysia } from "elysia";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";

export const AuthMiddleware = new Elysia()
  .derive(
    async (
      context,
    ): Promise<{
      user: User | null;
      session: Session | null;
    }> => {
      // CSRF check
      // TODO: Fix CSRF Check
      // if (context.request.method !== "GET") {
      //   const originHeader = context.request.headers.get("Origin");
      //   // NOTE: You may need to use `X-Forwarded-Host` instead
      //   const hostHeader = context.request.headers.get("Host");
      //   if (
      //     !originHeader ||
      //     !hostHeader ||
      //     !verifyRequestOrigin(originHeader, [hostHeader])
      //   ) {
      //     return {
      //       user: null,
      //       session: null,
      //     };
      //   }
      // }

      // use headers instead of Cookie API to prevent type coercion
      const cookieHeader = context.request.headers.get("Cookie") ?? "";
      const sessionId = lucia.readSessionCookie(cookieHeader);
      if (!sessionId) {
        return {
          user: null,
          session: null,
        };
      }

      const { session, user } = await lucia.validateSession(sessionId);
      if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        context.cookie[sessionCookie.name]?.set({
          value: sessionCookie.value,
          ...sessionCookie.attributes,
        });
      }
      if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        context.cookie[sessionCookie.name]?.set({
          value: sessionCookie.value,
          ...sessionCookie.attributes,
        });
      }
      return {
        user,
        session,
      };
    },
  )
  .propagate()
  .derive(
    async ({
      user,
      session,
    }): Promise<{
      user: User;
      session: Session;
    }> => {
      if (!user || !session) {
        throw new Error("Unauthorized");
      }
      return { user, session };
    },
  )
  .propagate();
