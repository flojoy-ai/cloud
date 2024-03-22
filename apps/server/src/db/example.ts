import _ from "lodash";
import type DB from "@/schemas/Database";

import { TRPCError } from "@trpc/server";
import { generateDatabaseId } from "@/lib/db-utils";
// import { createMeasurement } from "./measurement";
import { createModel } from "./model";
import { createProject } from "./project";
import { createTest } from "./test";
import { Kysely } from "kysely";
import { createProduct } from "./product";
import { err, ok, safeTry } from "neverthrow";
import { createFamily } from "./family";

const generateRandomNumbers = () => {
  const randomNumbers = [];

  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.random();
    randomNumbers.push(randomNumber);
  }

  return randomNumbers;
};

export async function populateExample(db: Kysely<DB>, workspaceId: string) {
  return safeTry(async function* () {
    const product = yield* (
      await createProduct(db, {
        name: "HL",
        workspaceId,
        description: "Hidden Level Product",
      })
    ).safeUnwrap();

    const family = yield* (
      await createFamily(db, {
        name: "HL1000",
        workspaceId,
        productId: product.id,
        description: "HL 1000 family",
      })
    ).safeUnwrap();

    const deviceModel1 = yield* (
      await createModel(db, {
        name: "HL1000A",
        workspaceId,
        familyId: family.id,
        components: [],
      })
    ).safeUnwrap();

    const deviceModel2 = yield* (
      await createModel(db, {
        name: "HL1000B",
        workspaceId,
        familyId: family.id,
        components: [],
      })
    ).safeUnwrap();

    const systemModel = yield* (
      await createModel(db, {
        name: "HL1000",
        workspaceId,
        familyId: family.id,
        components: [
          { modelId: deviceModel1.id, count: 2 },
          { modelId: deviceModel2.id, count: 2 },
        ],
      })
    ).safeUnwrap();

    const deviceProject = yield* (
      await createProject(db, {
        name: "HL1000A Testing Project",
        modelId: deviceModel1.id,
        workspaceId,
      })
    ).safeUnwrap();

    const booleanTest = yield* (
      await createTest(db, {
        name: "Pass/Fail Test",
        projectId: deviceProject.id,
        measurementType: "boolean",
      })
    ).safeUnwrap();

    const dataframeTest = yield* (
      await createTest(db, {
        name: "Expected vs Measured",
        projectId: deviceProject.id,
        measurementType: "dataframe",
      })
    ).safeUnwrap();

    const insertDevices = _.times(9, (i) => ({
      id: generateDatabaseId("hardware"),
      name: `SN000${i + 1}`,
      modelId: deviceModel1.id,
      workspaceId,
    }));

    const hardwares = await db
      .insertInto("hardware")
      .values([...insertDevices])
      .returningAll()
      .execute();

    if (!hardwares) {
      return err("Failed to create hardware devices");
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

    return ok(undefined);
  });
}
