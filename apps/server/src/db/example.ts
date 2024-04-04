import _ from "lodash";

import { generateDatabaseId } from "../lib/db-utils";
import { Kysely } from "kysely";
import { DB, WorkspaceUser } from "@cloud/shared";
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

export async function populateExample(
  db: Kysely<DB>,
  workspaceUser: WorkspaceUser,
) {
  const workspaceId = workspaceUser.workspaceId;

  return safeTry(async function* () {
    const product = yield* (
      await createProduct(db, {
        name: "Raspberry Pi 5",
        workspaceId,
        description: "Raspberry Pi 5",
      })
    ).safeUnwrap();

    const piPart = yield* (
      await createPart(db, {
        name: "Pi-5",
        workspaceId,
        productName: product.name,
        description: "The Raspberry Pi 5",
      })
    ).safeUnwrap();

    const cpuPart = yield* (
      await createPart(db, {
        name: "CPU",
        workspaceId,
        productName: product.name,
        description: "CPU",
      })
    ).safeUnwrap();

    const ramPart = yield* (
      await createPart(db, {
        name: "RAM",
        workspaceId,
        productName: product.name,
        description: "RAM module",
      })
    ).safeUnwrap();

    const diskPart = yield* (
      await createPart(db, {
        name: "Disk",
        workspaceId,
        productName: product.name,
        description: "Disk space",
      })
    ).safeUnwrap();

    const ram8GB = yield* (
      await createPartVariation(db, {
        partNumber: "RAM-8GB",
        description: "8GB RAM",
        workspaceId,
        partId: ramPart.id,
        components: [],
      })
    ).safeUnwrap();

    const ram4GB = yield* (
      await createPartVariation(db, {
        partNumber: "RAM-4GB",
        description: "4GB RAM",
        workspaceId,
        partId: ramPart.id,
        components: [],
      })
    ).safeUnwrap();

    const cpu1234 = yield* (
      await createPartVariation(db, {
        partNumber: "CPU-1234",
        description: "CPU 1234",
        workspaceId,
        partId: cpuPart.id,
        components: [],
      })
    ).safeUnwrap();

    const diskABCD = yield* (
      await createPartVariation(db, {
        partNumber: "Disk-ABCD",
        description: "Disk ABCD",
        workspaceId,
        partId: diskPart.id,
        components: [],
      })
    ).safeUnwrap();

    const pi58GB = yield* (
      await createPartVariation(db, {
        partNumber: "PI-5-8GB",
        description: "Pi 5 with 8GB RAM",
        workspaceId,
        partId: piPart.id,
        components: [
          { partVariationId: ram8GB.id, count: 1 },
          { partVariationId: cpu1234.id, count: 1 },
          { partVariationId: diskABCD.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    yield* (
      await createPartVariation(db, {
        partNumber: "PI-5-4GB",
        description: "Pi 5 with 4GB RAM",
        workspaceId,
        partId: piPart.id,
        components: [
          { partVariationId: ram4GB.id, count: 1 },
          { partVariationId: cpu1234.id, count: 1 },
          { partVariationId: diskABCD.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    const pi5Project = yield* (
      await createProject(db, {
        name: "Pi-5 Production Line",
        partVariationId: pi58GB.id,
        workspaceId,
      })
    ).safeUnwrap();

    await db
      .insertInto("project_user")
      .values({
        projectId: pi5Project.id,
        userId: workspaceUser.userId,
        role: "dev",
        workspaceId: workspaceUser.workspaceId,
      })
      .executeTakeFirstOrThrow();

    const booleanTest = yield* (
      await createTest(db, {
        name: "Pass/Fail Test",
        projectId: pi5Project.id,
        measurementType: "boolean",
      })
    ).safeUnwrap();

    const dataframeTest = yield* (
      await createTest(db, {
        name: "Expected vs Measured",
        projectId: pi5Project.id,
        measurementType: "dataframe",
      })
    ).safeUnwrap();

    const ram8GBUnits = _.times(9, (i) => ({
      id: generateDatabaseId("unit"),
      serialNumber: `RAM-8GB-00${i + 1}`,
      partVariationId: ram8GB.id,
      workspaceId,
    }));

    const cpuUnits = _.times(9, (i) => ({
      id: generateDatabaseId("unit"),
      serialNumber: `CPU-1234-00${i + 1}`,
      partVariationId: cpu1234.id,
      workspaceId,
    }));

    const diskUnits = _.times(9, (i) => ({
      id: generateDatabaseId("unit"),
      serialNumber: `DISK-ABCD-00${i + 1}`,
      partVariationId: diskABCD.id,
      workspaceId,
    }));

    const rams = await db
      .insertInto("unit")
      .values([...ram8GBUnits])
      .returningAll()
      .execute();

    const cpus = await db
      .insertInto("unit")
      .values([...cpuUnits])
      .returningAll()
      .execute();

    const disks = await db
      .insertInto("unit")
      .values([...diskUnits])
      .returningAll()
      .execute();

    if (!rams || !cpus || !disks) {
      return err("Failed to create unit devices");
    }

    const piUnits = _.times(9, (i) => ({
      id: generateDatabaseId("unit"),
      serialNumber: `RSP-PI-8GB-00${i + 1}`,
      partVariationId: pi58GB.id,
      workspaceId,
    }));

    const pis = await db
      .insertInto("unit")
      .values([...piUnits])
      .returningAll()
      .execute();

    await db
      .insertInto("unit_relation")
      .values(
        pis.map((pi, i) => ({
          parentUnitId: pi.id,
          childUnitId: cpus[i].id,
        })),
      )
      .execute();

    await db
      .insertInto("unit_relation")
      .values(
        pis.map((pi, i) => ({
          parentUnitId: pi.id,
          childUnitId: rams[i].id,
        })),
      )
      .execute();

    await db
      .insertInto("unit_relation")
      .values(
        pis.map((pi, i) => ({
          parentUnitId: pi.id,
          childUnitId: disks[i].id,
        })),
      )
      .execute();

    await db
      .insertInto("project_unit")
      .values(
        pis.map((hw) => ({
          unitId: hw.id,
          projectId: pi5Project.id,
        })),
      )
      .execute();

    const station = yield* (
      await createStation(db, {
        name: "Station 1",
        projectId: pi5Project.id,
      })
    ).safeUnwrap();

    for (let i = 0; i < pis.length; i++) {
      const unit = pis[i]!;

      const session = yield* (
        await createSession(db, {
          unitId: unit.id,
          projectId: pi5Project.id,
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
          unitId: unit.id,
          testId: booleanTest.id,
          projectId: pi5Project.id,
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
          unitId: unit.id,
          testId: dataframeTest.id,
          projectId: pi5Project.id,
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
