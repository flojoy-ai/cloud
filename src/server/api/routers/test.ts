import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { project, test } from "~/server/db/schema";
import { selectDeviceSchema } from "~/types/device";
import { selectMeasurementSchema } from "~/types/measurement";
import { publicInsertTestSchema, selectTestSchema } from "~/types/test";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { type db } from "~/server/db";
import { projectAccessMiddleware } from "./project";

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

  // There are 2 cases:
  // Case 1: Authentication with secret key, in this case workspaceId will be
  // defined in the ctx, thus just need to check if the resource belongs to that
  // workspace, then we will be done.
  if (
    opts.ctx.workspaceId &&
    test.project.workspace.id !== opts.ctx.workspaceId
  ) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this test",
    });
  }

  // Case 2: Authentication with session, in this case we need to check if the
  // has access to the workspace that this resource belongs to
  if (!opts.ctx.workspaceId) {
    const perm = await opts.ctx.db.query.workspace_user.findFirst({
      where: (workspace_user, { and, eq }) =>
        and(
          eq(workspace_user.workspaceId, test.project.workspace.id),
          eq(workspace_user.userId, opts.ctx.userId),
        ),
    });
    if (!perm) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You do not have access to this test",
      });
    }
  }

  return opts.next();
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
});
