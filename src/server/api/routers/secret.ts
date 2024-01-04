import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { secret, workspace } from "~/server/db/schema";
import { selectSecretSchema } from "~/types/secret";

import * as jose from "jose";
import { env } from "~/env";

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET);

export const secretRouter = createTRPCRouter({
  createSecret: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .output(selectSecretSchema)
    .mutation(async ({ ctx, input }) => {
      const date = new Date();

      const jwtValue = await new jose.SignJWT({
        userId: ctx.session.user.userId,
        workspaceId: input.workspaceId,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt(date)
        .sign(jwtSecret);

      await ctx.db
        .delete(secret)
        .where(
          and(
            eq(secret.workspaceId, input.workspaceId),
            eq(secret.userId, ctx.session.user.userId),
          ),
        );

      const [secretCreateResult] = await ctx.db
        .insert(secret)
        .values({
          userId: ctx.session.user.userId,
          workspaceId: input.workspaceId,
          value: jwtValue,
        })
        .returning();

      if (!secretCreateResult) {
        throw new Error("Failed to create test");
      }

      await ctx.db
        .update(workspace)
        .set({ updatedAt: new Date() })
        .where(eq(workspace.id, input.workspaceId));

      return secretCreateResult;
    }),

  getSecret: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .output(z.optional(selectSecretSchema))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.secret.findFirst({
        where: (secret, { eq, and }) =>
          and(
            eq(secret.workspaceId, input.workspaceId),
            eq(secret.userId, ctx.session.user.userId),
          ),
      });
    }),
});
