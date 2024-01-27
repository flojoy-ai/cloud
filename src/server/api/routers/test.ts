import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { project, test } from "~/server/db/schema";
import { selectHardwareBaseSchema } from "~/types/hardware";
import { selectMeasurementSchema } from "~/types/measurement";
import {
  publicInsertTestSchema,
  publicUpdateTestSchema,
  selectTestSchema,
} from "~/types/test";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { type db } from "~/server/db";
import { projectAccessMiddleware } from "./project";
import { checkWorkspaceAccess } from "~/lib/auth";

export const testAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { testId: string };
}>().create(async (opts) => {
  const test = await opts.ctx.db.query.test.findFirst({
    where: (test, { eq }) => eq(test.id, opts.input.testId),
    with: {
      project: {
        with: {
          workspace: true,
        },
      },
    },
  });

  if (!test) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Test not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    test.project.workspace.id,
  );
  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this test",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      workspaceId: workspaceUser.workspaceId,
      testId: test.id,
    },
  });
});

export const testRouter = createTRPCRouter({
  createTest: workspaceProcedure
    .meta({ openapi: { method: "POST", path: "/v1/tests/", tags: ["test"] } })
    .input(publicInsertTestSchema)
    .output(selectTestSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [testCreateResult] = await tx
          .insert(test)
          .values({
            name: input.name,
            projectId: input.projectId,
            measurementType: input.measurementType,
          })
          .returning();

        if (!testCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create test",
          });
        }

        await tx
          .update(project)
          .set({ updatedAt: new Date() })
          .where(eq(project.id, input.projectId));

        return testCreateResult;
      });
    }),

  getTestById: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/tests/{testId}", tags: ["test"] },
    })
    .input(z.object({ testId: z.string() }))
    .use(testAccessMiddleware)
    .output(
      selectTestSchema.merge(
        z.object({
          measurements: z.array(
            selectMeasurementSchema.merge(
              z.object({
                hardware: selectHardwareBaseSchema,
              }),
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
              hardware: {
                with: {
                  model: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Test not found",
        });
      }

      return result;
    }),

  getAllTestsByProjectId: workspaceProcedure
    .meta({ openapi: { method: "GET", path: "/v1/tests/", tags: ["test"] } })

    .input(z.object({ projectId: z.string() }))
    .use(projectAccessMiddleware)
    .output(z.array(selectTestSchema))
    .query(async ({ input, ctx }) => {
      return await ctx.db.query.test.findMany({
        where: (test, { eq }) => eq(test.projectId, input.projectId),
      });
    }),

  updateTest: workspaceProcedure
    .meta({
      openapi: { method: "PATCH", path: "/v1/tests/{testId}", tags: ["test"] },
    })
    .input(publicUpdateTestSchema.extend({ testId: z.string() }))
    .output(z.void())
    .use(testAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(test)
        .set({ name: input.name })
        .where(eq(test.id, input.testId));
    }),

  deleteTest: workspaceProcedure
    .meta({
      openapi: { method: "DELETE", path: "/v1/tests/{testId}", tags: ["test"] },
    })
    .input(z.object({ testId: z.string() }))
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(test).where(eq(test.id, input.testId));
    }),
});
