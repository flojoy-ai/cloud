import { lucia } from "../auth/lucia";
import { env } from "../env";
import { Elysia } from "elysia";
import { verifyRequestOrigin } from "lucia";

import type { User, Session } from "lucia";
import { getUrlFromUri } from "../lib/url";
import { Workspace } from "@cloud/shared";
import { db } from "../db/kysely";

type AuthMethod = "web" | "secret";

export const AuthMiddleware = new Elysia()
  .derive(
    async (
      context,
    ): Promise<{
      user: User | null;
      session: Session | null;
      authMethod: AuthMethod | null;
      workspace: Workspace | null;
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
            authMethod: null,
            workspace: null,
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
          authMethod: null,
          workspace: null,
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
        authMethod: "web",
        workspace: null,
      };
    },
  )
  .propagate()
  .derive(
    async (
      context,
    ): Promise<{
      user: User | null;
      session: Session | null;
      authMethod: AuthMethod | null;
      workspace: Workspace | null;
    }> => {
      if (context.user && context.session && context.authMethod) {
        return {
          user: context.user,
          session: context.session,
          authMethod: context.authMethod,
          workspace: null,
        };
      }

      const personalSecret =
        context.request.headers.get("flojoy-workspace-personal-secret") ?? "";

      const sessionId = lucia.readSessionCookie(
        "auth_session=" + personalSecret,
      );
      if (!sessionId) {
        return {
          user: null,
          session: null,
          authMethod: null,
          workspace: null,
        };
      }

      const { session, user } = await lucia.validateSession(sessionId);
      let workspace: Workspace | undefined;

      if (session) {
        workspace = await db
          .selectFrom("workspace as w")
          .selectAll("w")
          .innerJoin("user_session as us", "workspaceId", "w.id")
          .where("us.id", "=", session.id)
          .executeTakeFirst();
      }

      return {
        user,
        session,
        authMethod: "secret",
        workspace: workspace ?? null,
      };
    },
  )
  .propagate()
  .derive(async ({ user, session, authMethod, workspace, error }) => {
    if (!user || !session || !authMethod) {
      return error("Unauthorized");
    }
    if (authMethod === "secret" && workspace === null) {
      return error(500, "Failed to infer workspace from workspace secret");
    }
    return { user, session, authMethod, workspace };
  })
  .propagate();
