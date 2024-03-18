/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

import { db } from "~/server/db";

import { validateRequest } from "~/auth/lucia";
import * as context from "next/headers";
import { type OpenApiMeta } from "trpc-openapi";
import * as jose from "jose";
import { env } from "~/env";
import { tryCatch } from "~/types/result";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { user } = await validateRequest();

  const workspaceId = opts.headers.get("flojoy-cloud-workspace-id");
  return {
    db,
    user,
    workspaceId,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC
  .context<typeof createTRPCContext>()
  .meta<OpenApiMeta>()
  .create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError:
            error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

/**
 * Workspace (authenticated) procedure
 *
 * Any operations within a workspace should use this procedure!
 *
 * If you want a query or mutation to ONLY be accessible to logged in users,
 * and you want to ensure that the user has access to the given workspace specified
 * in the HTTP header, use this. This guarantees to return a valid
 * `userId` and `workspaceId` in the context for use. This procedure also supports
 * authentication via the Flojoy Cloud API key, which is a JWT token
 *
 * @see https://trpc.io/docs/procedures
 */

export const workspaceProcedure = t.procedure.use(async ({ ctx, next }) => {
  const workspaceSecret = ctx.headers.get("Authorization");

  let userId;
  let workspaceId = ctx.workspaceId;

  if (ctx.user) {
    userId = ctx.user.id;

    const scopeCookie = context.cookies().get("scope");
    if (!scopeCookie) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "scope missing in cookies",
      });
    }

    const workspace = await ctx.db
      .selectFrom("workspace")
      .selectAll("workspace")
      .where("workspace.namespace", "=", scopeCookie.value)
      .executeTakeFirst();

    if (!workspace) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "workspace not found",
      });
    }
    workspaceId = workspace.id;
  } else if (workspaceSecret) {
    const res = tryCatch(
      async () => {
        const { payload } = await jose.jwtVerify(
          workspaceSecret.slice("Bearer ".length),
          new TextEncoder().encode(env.JWT_SECRET),
          {},
        );
        return payload;
      },
      () =>
        new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "Failed to validate JWT, did you specify the correct API key? You can get your API key from the 'API key' tab under your workspace settings",
        }),
    );

    if (!res.ok) {
      throw res.error;
    }
    const payload = await res.value;

    const parsed = z
      .object({
        userId: z.string().startsWith("user_"),
        workspaceId: z.string().startsWith("workspace_"),
      })
      .safeParse(payload);

    if (!parsed.success) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "the given JWT is invalid, parsing failed",
      });
    }

    userId = parsed.data.userId;
    workspaceId = parsed.data.workspaceId;

    await ctx.db
      .updateTable("secret")
      .set({
        lastUsedAt: new Date(),
      })
      .where("secret.workspaceId", "=", workspaceId)
      .where("secret.userId", "=", userId)
      .execute();
  } else {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "no session or API key provided",
    });
  }

  return next({
    ctx: {
      user: {
        id: userId,
      }, // this cannot be null

      // when the workspaceId is not null, then we need to make sure
      // the request does not access anything outside of this workspace
      workspaceId, // this can be null
    },
  });
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;
