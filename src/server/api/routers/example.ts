import { z } from "zod";
import { workspaceAccessMiddleware } from "./workspace";

import _ from "lodash";

import { createTRPCRouter, workspaceProcedure } from "~/server/api/trpc";

import { TRPCError } from "@trpc/server";
import { api } from "~/trpc/server";
import { generateDatabaseId } from "~/lib/id";

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
      return await ctx.db.transaction().execute(async (tx) => {
        const deviceModel1 = await api.model.createModel.mutate({
          name: "HL1234",
          workspaceId: input.workspaceId,
          components: [],
        });

        const deviceModel2 = await api.model.createModel.mutate({
          name: "HL2345",
          workspaceId: input.workspaceId,
          components: [],
        });

        const systemModel = await api.model.createModel.mutate({
          name: "HL9876",
          workspaceId: input.workspaceId,
          components: [
            { modelId: deviceModel1.id, count: 2 },
            { modelId: deviceModel2.id, count: 2 },
          ],
        });

        const deviceProject = await api.project.createProject.mutate({
          name: "HL1234 Testing Project",
          modelId: deviceModel1.id,
          workspaceId: input.workspaceId,
        });

        const booleanTest = await api.test.createTest.mutate({
          name: "Pass/Fail Test",
          projectId: deviceProject.id,
          measurementType: "boolean",
        });

        const dataframeTest = await api.test.createTest.mutate({
          name: "Expected vs Measured",
          projectId: deviceProject.id,
          measurementType: "dataframe",
        });

        const insertDevices = _.times(9, (i) => ({
          id: generateDatabaseId("hardware"),
          name: `SN000${i + 1}`,
          modelId: deviceModel1.id,
          workspaceId: input.workspaceId,
        }));

        const hardwares = await tx
          .insertInto("hardware")
          .values([...insertDevices])
          .returningAll()
          .execute();

        if (!hardwares) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create hardware entries",
          });
        }

        await tx
          .insertInto("project_hardware")
          .values(
            hardwares.map((hw) => ({
              hardwareId: hw.id,
              projectId: deviceProject.id,
            })),
          )
          .execute();

        const boolMeas = hardwares.map((hardware, i) => {
          const val = Math.random() < 0.8;
          return {
            id: generateDatabaseId("measurement"),
            name: "Did Power On",
            hardwareId: hardware.id,
            testId: booleanTest.id,
            createdAt: new Date(new Date().getTime() + i * 20000),
            data: { type: "boolean" as const, value: val },
            pass: val,
            storageProvider: "postgres" as const, // TODO: make this configurable
          };
        });

        const boolMeasCreateResult = await tx
          .insertInto("measurement")
          .values(boolMeas)
          .returningAll()
          .execute();

        if (!boolMeasCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurements",
          });
        }

        const dataframeMeas = hardwares.map((hardware, i) => ({
          id: generateDatabaseId("measurement"),
          name: "Data Point",
          hardwareId: hardware.id,
          testId: dataframeTest.id,
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
          .insertInto("measurement")
          .values(dataframeMeas)
          .returningAll()
          .execute();

        if (!dataframeMeasCreateResult) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create measurements",
          });
        }
      });
    }),
});
