import { lucia } from "../auth/lucia";
import { env } from "../env";
import { Elysia, t } from "elysia";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";
import { getUrlFromUri } from "../lib/url";
import { decryptWorkspacePersonalAccessToken } from "../lib/secret";
import { db } from "../db/kysely";

export const AuthMiddleware = new Elysia()
  .derive(
    async (
      context,
    ): Promise<{
      user: User | null;
      session: Session | null;
    }> => {
      // CSRF check
      if (context.request.method !== "GET") {
        const originHeader = context.request.headers.get("Origin");
        // NOTE: You may need to use `X-Forwarded-Host` instead
        const hostHeader = context.request.headers.get("Host");
        if (
          !originHeader ||
          !hostHeader ||
          !verifyRequestOrigin(originHeader, [
            hostHeader,
            getUrlFromUri(env.WEB_URI),
          ])
        ) {
          return {
            user: null,
            session: null,
          };
        }
      }

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
  .guard({
    headers: t.Object({
      "flojoy-workspace-personal-access-token": t.Optional(t.String()),
      "flojoy-workspace-id": t.Optional(t.String()),
    }),
  })
  .derive(
    async ({
      headers,
      user,
      session,
    }): Promise<{
      user: User;
    }> => {
      if (!user || !session) {
        const personalAccessToken =
          headers["flojoy-workspace-personal-access-token"];
        const workspaceId = headers["flojoy-workspace-id"];
        if (personalAccessToken && workspaceId) {
          const value =
            await decryptWorkspacePersonalAccessToken(personalAccessToken);
          const user = await db
            .selectFrom("user as u")
            .where("u.id", "=", value.userId)
            .selectAll()
            .executeTakeFirstOrThrow();
          return { user };
        }
        throw new Error("Unauthorized");
      }
      return { user };
    },
  )
  .propagate();
