import { z } from "zod";
import { workspaceAccessMiddleware } from "./workspace";

import {
  project,
  test,
  device,
  project_hardware,
  measurement,
  model,
  hardware,
  deviceModel,
} from "~/server/db/schema";

import _ from "lodash";

import { eq } from "drizzle-orm";
import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";
import { workspace } from "~/server/db/schema";

import { TRPCError } from "@trpc/server";

const generateRandomNumbers = () => {
  const randomNumbers = [];

  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.random();
    randomNumbers.push(randomNumber);
  }

  return randomNumbers;
};

export const exampleRouter = createTRPCRouter({
  populateExample: workspaceProcedure
    .input(z.object({ workspaceId: z.string() }))
    .use(workspaceAccessMiddleware)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.transaction(async (tx) => {
        const [newModel] = await tx
          .insert(model)
          .values({
            name: "HL1234",
            workspaceId: input.workspaceId,
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
            workspaceId: input.workspaceId,
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
          workspaceId: input.workspaceId,
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
          .where(eq(workspace.id, input.workspaceId));
      });
    }),
});
