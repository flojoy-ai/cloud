import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { secretTable, workspaceTable } from "~/server/db/schema";
import { selectSecretSchema } from "~/types/secret";

import * as jose from "jose";
import { env } from "~/env";
import { workspaceAccessMiddleware } from "./workspace";
import { TRPCError } from "@trpc/server";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export const secretRouter = createTRPCRouter({
  _createSecret: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(selectSecretSchema)
    .mutation(async ({ ctx, input }) => {
      const date = new Date();

      const jwtValue = await new jose.SignJWT({
        userId: ctx.userId,
        workspaceId: input.workspaceId,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(date)
        .sign(jwtSecret);

      await ctx.db
        .delete(secretTable)
        .where(
          and(
            eq(secretTable.workspaceId, input.workspaceId),
            eq(secretTable.userId, ctx.userId),
          ),
        );

      const [secretCreateResult] = await ctx.db
        .insert(secretTable)
        .values({
          userId: ctx.userId,
          workspaceId: input.workspaceId,
          value: jwtValue,
        })
        .returning();

      if (!secretCreateResult) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create secret",
        });
      }

      await ctx.db
        .update(workspaceTable)
        .set({ updatedAt: new Date() })
        .where(eq(workspaceTable.id, input.workspaceId));

      return secretCreateResult;
    }),

  _getSecret: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.optional(selectSecretSchema))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.secretTable.findFirst({
        where: (secret, { eq, and }) =>
          and(
            eq(secret.workspaceId, input.workspaceId),
            eq(secret.userId, ctx.userId),
          ),
      });
    }),
});
