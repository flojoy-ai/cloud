import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  workspaceProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import {
  workspace,
  user,
  workspace_user,
  project,
  test,
  device,
  project_hardware,
  measurement,
  model,
  hardware,
  deviceModel,
} from "~/server/db/schema";
import {
  publicInsertWorkspaceSchema,
  selectWorkspaceSchema,
} from "~/types/workspace";

import { TRPCError, experimental_standaloneMiddleware } from "@trpc/server";
import { checkWorkspaceAccess } from "~/lib/auth";
import { cookies } from "next/headers";
import _ from "lodash";
import { selectWorkspaceUserSchema } from "~/types/workspace_user";

const generateRandomNumbers = () => {
  const randomNumbers = [];

  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.random();
    randomNumbers.push(randomNumber);
  }

  return randomNumbers;
};

export const workspaceAccessMiddleware = experimental_standaloneMiddleware<{
  ctx: { db: typeof db; userId: string; workspaceId: string | null };
  input: { workspaceId: string };
}>().create(async (opts) => {
  const workspace = await opts.ctx.db.query.workspace.findFirst({
    where: (workspace, { eq }) => eq(workspace.id, opts.input.workspaceId),
  });

  if (!workspace) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Workspace not found",
    });
  }

  const workspaceUser = await checkWorkspaceAccess(
    opts.ctx,
    opts.input.workspaceId,
  );
  if (!workspaceUser) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You do not have access to this workspace",
    });
  }

  return opts.next({
    // this infers the `workspaceId` in ctx to be non-null
    // and also adds the respective resource id as well for use
    ctx: {
      workspaceId: workspaceUser.workspaceId,
    },
  });
});

export const workspaceRouter = createTRPCRouter({
  createWorkspace: protectedProcedure
    .input(publicInsertWorkspaceSchema)
    .output(selectWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const [newWorkspace] = await tx
          .insert(workspace)
          .values({ planType: "enterprise", ...input })
          .returning();

        if (!newWorkspace) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create workspace",
          });
        }

        await tx.insert(workspace_user).values({
          workspaceId: newWorkspace.id,
          userId: ctx.session.user.userId,
          workspaceRole: "owner",
        });

        cookies().set("scope", newWorkspace.namespace);

        if (!input.populateData) {
          return newWorkspace;
        }

        const [newModel] = await tx
          .insert(model)
          .values({
            name: "HL1234",
            workspaceId: newWorkspace.id,
          })
          .returning();

        if (!newModel) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create model",
          });
        }

        await tx.insert(deviceModel).values({
          id: newModel.id,
        });

        const [newProject] = await tx
          .insert(project)
          .values({
            name: "HL1234 Testing Project",
            modelId: newModel.id,
            workspaceId: newWorkspace.id,
          })
          .returning();

        if (!newProject) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create project",
          });
        }

        const [booleanTest] = await tx
          .insert(test)
          .values({
            name: "Pass/Fail Test",
            projectId: newProject.id,
            measurementType: "boolean",
          })
          .returning();

        if (!booleanTest) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create test",
          });
        }

        const insertDevices = _.times(9, (i) => ({
          name: `SN000${i + 1}`,
          modelId: newModel.id,
          workspaceId: newWorkspace.id,
        }));

        const hardwareEntries = await tx
          .insert(hardware)
          .values([...insertDevices])
          .returning();

        if (!hardwareEntries) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create hardware entries",
          });
        }

        const devices = await tx
          .insert(device)
          .values(
            hardwareEntries.map((h) => ({
              id: h.id,
            })),
          )
          .returning();

        if (!hardwareEntries) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create hardware entries",
          });
        }

        for (const device of devices) {
          await tx.insert(project_hardware).values({
            hardwareId: device.id,
            projectId: newProject.id,
          });
        }

        const boolMeas = devices.map((device, i) => ({
          name: "Did Power On",
          hardwareId: device.id,
          testId: booleanTest.id,
          measurementType: "boolean" as const,
          createdAt: new Date(new Date().getTime() + i * 20000),
          data: { type: "boolean" as const, passed: Math.random() < 0.8 },
          storageProvider: "postgres" as const, // TODO: make this configurable
        }));

        const boolMeasCreateResult = await tx
          .insert(measurement)
          .values([...boolMeas])
          .returning();

        if (!boolMeasCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurements",
          });
        }

        await Promise.all(
          _.uniq(
            boolMeasCreateResult.map((measurement) => measurement.testId),
          ).map(async (testId) => {
            await ctx.db
              .update(test)
              .set({ updatedAt: new Date() })
              .where(eq(test.id, testId));
          }),
        );

        const [dataframeTest] = await tx
          .insert(test)
          .values({
            name: "Expected vs Measured",
            projectId: newProject.id,
            measurementType: "dataframe",
          })
          .returning();

        if (!dataframeTest) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create test",
          });
        }

        const dataframeMeas = devices.map((device, i) => ({
          name: "Data Point",
          hardwareId: device.id,
          testId: dataframeTest.id,
          measurementType: "dataframe" as const,
          createdAt: new Date(new Date().getTime() + i * 20000),
          data: {
            type: "dataframe" as const,
            dataframe: {
              x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              y: generateRandomNumbers(),
            },
          },
          storageProvider: "postgres" as const, // TODO: make this configurable
        }));

        const dataframeMeasCreateResult = await tx
          .insert(measurement)
          .values([...dataframeMeas])
          .returning();

        if (!dataframeMeasCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurements",
          });
        }

        await Promise.all(
          _.uniq(
            dataframeMeasCreateResult.map((measurement) => measurement.testId),
          ).map(async (testId) => {
            await ctx.db
              .update(test)
              .set({ updatedAt: new Date() })
              .where(eq(test.id, testId));
          }),
        );

        await tx
          .update(workspace)
          .set({ updatedAt: new Date() })
          .where(eq(workspace.id, newWorkspace.id));

        return newWorkspace;
      });
    }),

  updateWorkspace: workspaceProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: "/v1/workspaces/{workspaceId}",
        tags: ["workspace"],
      },
    })
    .input(
      publicInsertWorkspaceSchema.merge(z.object({ workspaceId: z.string() })),
    )
    .output(selectWorkspaceSchema)
    .use(workspaceAccessMiddleware)
    .mutation(async ({ ctx, input }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { workspaceId, ...updatedWorkspace } = input;
      const [result] = await ctx.db
        .update(workspace)
        .set(updatedWorkspace)
        .where(eq(workspace.id, ctx.workspaceId))
        .returning();
      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workspace",
        });
      }

      return result;
    }),

  deleteWorkspaceById: workspaceProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/v1/workspaces/{workspaceId}",
        tags: ["workspace"],
      },
    })
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(workspace).where(eq(workspace.id, input.workspaceId));
    }),

  getWorkspaces: protectedProcedure
    .meta({
      openapi: { method: "GET", path: "/v1/workspaces/", tags: ["workspace"] },
    })
    .input(z.void())
    .output(
      z.array(
        selectWorkspaceSchema.merge(
          selectWorkspaceUserSchema.pick({ workspaceRole: true }),
        ),
      ),
    )
    .query(async ({ ctx }) => {
      const result = await ctx.db
        .select({
          workspace: workspace,
          workspaceUser: workspace_user,
        })
        .from(workspace_user)
        .innerJoin(workspace, eq(workspace_user.workspaceId, workspace.id))
        .innerJoin(user, eq(workspace_user.userId, user.id))
        .where(eq(user.id, ctx.session.user.userId));

      return result.map((w) => ({
        ...w.workspace,
        workspaceRole: w.workspaceUser.workspaceRole,
      }));
    }),

  getWorkspaceById: workspaceProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/v1/workspaces/{workspaceId}",
        tags: ["workspace"],
      },
    })
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(selectWorkspaceSchema)
    .query(async ({ input }) => {
      const result = await db.query.workspace.findFirst({
        where: (workspace, { eq }) => eq(workspace.id, input.workspaceId),
      });

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workspace not found",
        });
      }
      return result;
    }),
  getWorkspaceIdByNamespace: protectedProcedure
    .input(z.object({ namespace: z.string() }))
    .output(z.string())
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.query.workspace.findFirst({
        where: (workspace, { eq }) => eq(workspace.namespace, input.namespace),
      });
      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workspace not found",
        });
      }
      return result.id;
    }),
});
