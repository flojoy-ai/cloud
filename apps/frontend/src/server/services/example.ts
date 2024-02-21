import _ from "lodash";
import type DB from "~/schemas/Database";

import { TRPCError } from "@trpc/server";
import { generateDatabaseId } from "~/lib/id";
import { createMeasurement } from "~/server/services/measurement";
import { createModel } from "~/server/services/model";
import { createProject } from "~/server/services/project";
import { createTest } from "~/server/services/test";
import { Kysely } from "kysely";

const generateRandomNumbers = () => {
  const randomNumbers = [];

  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.random();
    randomNumbers.push(randomNumber);
  }

  return randomNumbers;
};

export async function populateExample(db: Kysely<DB>, workspaceId: string) {
  const deviceModel1 = await createModel(db, {
    name: "HL1234",
    workspaceId,
    components: [],
  });

  const deviceModel2 = await createModel(db, {
    name: "HL2345",
    workspaceId,
    components: [],
  });

  const systemModel = await createModel(db, {
    name: "HL9876",
    workspaceId,
    components: [
      { modelId: deviceModel1.id, count: 2 },
      { modelId: deviceModel2.id, count: 2 },
    ],
  });

  const deviceProject = await createProject(db, {
    name: "HL1234 Testing Project",
    modelId: deviceModel1.id,
    workspaceId,
  });

  const booleanTest = await createTest(db, {
    name: "Pass/Fail Test",
    projectId: deviceProject.id,
    measurementType: "boolean",
  });

  const dataframeTest = await createTest(db, {
    name: "Expected vs Measured",
    projectId: deviceProject.id,
    measurementType: "dataframe",
  });

  const insertDevices = _.times(9, (i) => ({
    id: generateDatabaseId("hardware"),
    name: `SN000${i + 1}`,
    modelId: deviceModel1.id,
    createdAt: new Date(new Date().getTime() + i * 20000),
    workspaceId,
  }));

  const hardwares = await db
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

  await db
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
      name: "Did Power On",
      hardwareId: hardware.id,
      testId: booleanTest.id,
      createdAt: new Date(new Date().getTime() + i * 20000),
      data: { type: "boolean" as const, value: val },
      pass: val,
      tagNames: ["example"],
    };
  });

  for (const meas of boolMeas) {
    await createMeasurement(db, workspaceId, meas);
  }

  const dataframeMeas = hardwares.map((hardware, i) => ({
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
    tagNames: ["example"],
  }));

  for (const meas of dataframeMeas) {
    await createMeasurement(db, workspaceId, meas);
  }
}
