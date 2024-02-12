import { z } from "zod";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { type db } from "~/server/db";
import { projectAccessMiddleware } from "./project";
import { checkWorkspaceAccess } from "~/lib/auth";
import { insertTestSchema, updateTestSchema } from "~/types/test";
import { test } from "~/schemas/public/Test";
import { generateDatabaseId } from "~/lib/id";
import { markUpdatedAt } from "~/lib/query";
import { DatabaseError } from "pg";

export const testAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; user: { id: string }; workspaceId: string | null };
  input: { testId: string };
}>().create(async (opts) => {
  const test = await opts.ctx.db
    .selectFrom("test")
    .where("test.id", "=", opts.input.testId)
    .innerJoin("project", "test.projectId", "project.id")
    .selectAll()
    .executeTakeFirstOrThrow(
      () =>
        new TRPCError({
          code: "BAD_REQUEST",
          message: "Test not found",
        }),
    );

  const workspaceUser = await checkWorkspaceAccess(opts.ctx, test.workspaceId);
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
      workspaceUser,
      test,
    },
  });
});

export const testRouter = createTRPCRouter({
  createTest: workspaceProcedure
    .meta({ openapi: { method: "POST", path: "/v1/tests/", tags: ["test"] } })
    .input(insertTestSchema)
    .output(test)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction().execute(async (tx) => {
        try {
          const test = await tx
            .insertInto("test")
            .values({
              id: generateDatabaseId("test"),
              ...input,
            })
            .returningAll()
            .executeTakeFirstOrThrow(
              () =>
                new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to create test",
                }),
            );

          await markUpdatedAt(tx, "project", input.projectId);

          return test;
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          const err = error as DatabaseError;
          if (err.code === "23505") {
            throw new TRPCError({
              code: "CONFLICT",
              message: `A test with name "${input.name}" already exists!`,
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            cause: err,
            message: "Internal server error",
          });
        }
      });
    }),

  getTestById: workspaceProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/tests/{testId}", tags: ["test"] },
    })
    .input(z.object({ testId: z.string() }))
    .use(testAccessMiddleware)
    .output(test)
    .query(async ({ ctx }) => {
      return ctx.test;
    }),

  getAllTestsByProjectId: workspaceProcedure
    .meta({ openapi: { method: "GET", path: "/v1/tests/", tags: ["test"] } })

    .input(z.object({ projectId: z.string() }))
    .use(projectAccessMiddleware)
    .output(z.array(test))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .selectFrom("test")
        .selectAll()
        .where("test.projectId", "=", input.projectId)
        .execute();
    }),

  updateTest: workspaceProcedure
    .meta({
      openapi: { method: "PATCH", path: "/v1/tests/{testId}", tags: ["test"] },
    })
    .input(updateTestSchema.extend({ testId: z.string() }))
    .output(z.void())
    .use(testAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .updateTable("test")
        .set({ name: input.name })
        .where("test.id", "=", input.testId)
        .execute();
    }),

  deleteTest: workspaceProcedure
    .meta({
      openapi: { method: "DELETE", path: "/v1/tests/{testId}", tags: ["test"] },
    })
    .input(z.object({ testId: z.string() }))
    .use(testAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      if (ctx.workspaceUser.role !== "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this workspace",
        });
      }

      await ctx.db
        .deleteFrom("test")
        .where("test.id", "=", input.testId)
        .execute();
    }),
});
