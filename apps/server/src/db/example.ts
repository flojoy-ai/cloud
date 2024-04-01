import _ from "lodash";

import { generateDatabaseId } from "../lib/db-utils";
import { Kysely } from "kysely";
import { DB } from "@cloud/shared";
import { err, ok, safeTry } from "neverthrow";
import { createPart } from "./part";
import { createMeasurement } from "./measurement";
import { createPartVariation } from "./part-variation";
import { createProduct } from "./product";
import { createProject } from "./project";
import { createSession } from "./session";
import { createStation } from "./station";
import { createTest } from "./test";

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
        name: "iPhone 13 mini",
        workspaceId,
        description: "iPhone 13 mini",
      })
    ).safeUnwrap();

    const part = yield* (
      await createPart(db, {
        name: "iPhone",
        workspaceId,
        productName: product.name,
        description: "The iPhone lineup from Apple",
      })
    ).safeUnwrap();

    const devicePartVariation1 = yield* (
      await createPartVariation(db, {
        partNumber: "DISPLAY0001",
        description: "iPhone 13 mini display",
        workspaceId,
        partId: part.id,
        components: [],
      })
    ).safeUnwrap();

    const devicePartVariation2 = yield* (
      await createPartVariation(db, {
        partNumber: "SPEAKER0001",
        description: "iPhone 13 mini speaker",
        workspaceId,
        partId: part.id,
        components: [],
      })
    ).safeUnwrap();

    yield* (
      await createPartVariation(db, {
        partNumber: "IP13MINI",
        description: "iPhone 13 mini",
        workspaceId,
        partId: part.id,
        components: [
          { partVariationId: devicePartVariation1.id, count: 2 },
          { partVariationId: devicePartVariation2.id, count: 2 },
        ],
      })
    ).safeUnwrap();

    const deviceProject = yield* (
      await createProject(db, {
        name: "DISPLAY0001 Production Line",
        partVariationId: devicePartVariation1.id,
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
      serialNumber: `SN000${i + 1}`,
      partVariationId: devicePartVariation1.id,
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

    const station = yield* (
      await createStation(db, {
        name: "Station 1",
        projectId: deviceProject.id,
      })
    ).safeUnwrap();

    for (let i = 0; i < hardwares.length; i++) {
      const hardware = hardwares[i]!;

      const session = yield* (
        await createSession(db, {
          hardwareId: hardware.id,
          projectId: deviceProject.id,
          stationId: station.id,
          notes: "This is a test session",
          integrity: true,
          aborted: false,
        })
      ).safeUnwrap();

      const val = Math.random() < 0.8;
      yield* (
        await createMeasurement(db, workspaceId, {
          name: "Did Light Up",
          hardwareId: hardware.id,
          testId: booleanTest.id,
          projectId: deviceProject.id,
          sessionId: session.id,
          createdAt: new Date(new Date().getTime() + i * 20000),
          data: { type: "boolean" as const, value: val },
          pass: val,
          tagNames: ["example"],
        })
      ).safeUnwrap();
      yield* (
        await createMeasurement(db, workspaceId, {
          name: "Data Point",
          hardwareId: hardware.id,
          testId: dataframeTest.id,
          projectId: deviceProject.id,
          sessionId: session.id,
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
        })
      ).safeUnwrap();
    }

    return ok(undefined);
  });
}
