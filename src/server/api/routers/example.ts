import { z } from "zod";
import { workspaceAccessMiddleware } from "./workspace";

import {
  deviceTable,
  projectHardwareTable,
  measurementTable,
  hardwareTable,
} from "~/server/db/schema";

import _ from "lodash";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";

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
        const newDeviceModel1 = await api.model.createDeviceModel.mutate({
          name: "HL1234",
          workspaceId: input.workspaceId,
        });

        const newDeviceModel2 = await api.model.createDeviceModel.mutate({
          name: "HL2345",
          workspaceId: input.workspaceId,
        });

        const newSystemModel = await api.model.createSystemModel.mutate({
          name: "HL9876",
          workspaceId: input.workspaceId,
          parts: [
            { modelId: newDeviceModel1.id, count: 2 },
            { modelId: newDeviceModel2.id, count: 2 },
          ],
        });

        const newDeviceProject = await api.project.createProject.mutate({
          name: "HL1234 Testing Project",
          modelId: newDeviceModel1.id,
          workspaceId: input.workspaceId,
        });

        const booleanTest = await api.test.createTest.mutate({
          name: "Pass/Fail Test",
          projectId: newDeviceProject.id,
          measurementType: "boolean",
        });

        const dataframeTest = await api.test.createTest.mutate({
          name: "Expected vs Measured",
          projectId: newDeviceProject.id,
          measurementType: "dataframe",
        });

        const insertDevices = _.times(9, (i) => ({
          name: `SN000${i + 1}`,
          modelId: newDeviceModel1.id,
          workspaceId: input.workspaceId,
        }));

        const hardwareEntries = await tx
          .insert(hardwareTable)
          .values([...insertDevices])
          .returning();

        if (!hardwareEntries) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create hardware entries",
          });
        }

        const devices = await tx
          .insert(deviceTable)
          .values(
            hardwareEntries.map((h) => ({
              id: h.id,
            })),
          )
          .returning();

        if (!devices) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create devices",
          });
        }

        for (const device of devices) {
          await tx.insert(projectHardwareTable).values({
            hardwareId: device.id,
            projectId: newDeviceProject.id,
          });
        }

        const boolMeas = devices.map((device, i) => {
          const val = Math.random() < 0.8;
          return {
            name: "Did Power On",
            hardwareId: device.id,
            testId: booleanTest.id,
            measurementType: "boolean" as const,
            createdAt: new Date(new Date().getTime() + i * 20000),
            data: { type: "boolean" as const, value: val },
            pass: val,
            storageProvider: "postgres" as const, // TODO: make this configurable
          };
        });

        const boolMeasCreateResult = await tx
          .insert(measurementTable)
          .values([...boolMeas])
          .returning();

        if (!boolMeasCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurements",
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
            value: {
              x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              y: generateRandomNumbers(),
            },
          },
          pass: Math.random() < 0.7 ? true : null,
          storageProvider: "postgres" as const, // TODO: make this configurable
        }));

        const dataframeMeasCreateResult = await tx
          .insert(measurementTable)
          .values([...dataframeMeas])
          .returning();

        if (!dataframeMeasCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurements",
          });
        }
      });
    }),
});
