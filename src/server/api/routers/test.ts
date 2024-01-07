import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { project, test } from "~/server/db/schema";
import { selectDeviceSchema } from "~/types/device";
import { selectMeasurementSchema } from "~/types/measurement";
import { insertTestSchema, selectTestSchema } from "~/types/test";

export const testRouter = createTRPCRouter({
  createTest: workspaceProcedure
    .input(insertTestSchema)
    .output(selectTestSchema)
    .mutation(async ({ ctx, input }) => {
      const [testCreateResult] = await ctx.db
        .insert(test)
        .values({
          name: input.name,
          projectId: input.projectId,
          measurementType: input.measurementType,
        })
        .returning();

      if (!testCreateResult) {
        throw new Error("Failed to create test");
      }

      await ctx.db
        .update(project)
        .set({ updatedAt: new Date() })
        .where(eq(project.id, input.projectId));
      return testCreateResult;
    }),

  getTestById: workspaceProcedure
    .input(z.object({ testId: z.string() }))
    .output(
      selectTestSchema.merge(
        z.object({
          measurements: z.array(
            selectMeasurementSchema.merge(
              z.object({ test: selectTestSchema, device: selectDeviceSchema }),
            ),
          ),
        }),
      ),
    )
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.test.findFirst({
        where: (test, { eq }) => eq(test.id, input.testId),
        with: {
          measurements: {
            with: {
              device: true,
              test: true,
            },
          },
        },
      });

      if (!result) {
        throw new Error("Failed to find test");
      }

      return result;
    }),

  getAllTestsByProjectId: workspaceProcedure
    .input(z.object({ projectId: z.string() }))
    .output(z.array(selectTestSchema))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.test.findMany({
        where: (test, { eq }) => eq(test.projectId, input.projectId),
      });
    }),
});
