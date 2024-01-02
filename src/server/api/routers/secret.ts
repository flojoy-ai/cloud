import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { project, secret } from "~/server/db/schema";
import { publicInsertSecretSchema, selectSecretSchema } from "~/types/secret";

export const secretRouter = createTRPCRouter({
  createSecret: protectedProcedure
    .input(publicInsertSecretSchema)
    .output(selectSecretSchema)
    .mutation(async ({ ctx, input }) => {
      const [secretCreateResult] = await ctx.db
        .insert(secret)
        .values({
          userId: ctx.session.user.userId,
          projectId: input.projectId,
        })
        .returning();

      if (!secretCreateResult) {
        throw new Error("Failed to create test");
      }

      await ctx.db
        .update(project)
        .set({ updatedAt: new Date() })
        .where(eq(project.id, input.projectId));

      return secretCreateResult;
    }),

  getSecretByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .output(z.optional(selectSecretSchema))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.query.secret.findFirst({
        where: (secret, { eq }) => eq(secret.projectId, input.projectId),
      });
    }),
});
