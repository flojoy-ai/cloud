import _ from "lodash";

import { DB, WorkspaceUser } from "@cloud/shared";
import { Kysely } from "kysely";
import { ok, safeTry } from "neverthrow";
import { generateDatabaseId } from "../lib/db-utils";
import { createPart } from "./part";
import { createPartVariation } from "./part-variation";
import { createProduct } from "./product";
import { createProject } from "./project";
import { createSession } from "./session";
import { createStation } from "./station";
import { createTest } from "./test";

const generateTemperature = () => {
  // Generate a time series with Overheat (150C) at 0.1% chance
  const nbPoint = 10;
  const temperatures = [];
  const tmp = Math.round(Math.random() * 100)
  for (let i = 0; i < nbPoint; i++) {
    const temp = Math.random() < 0.02 ? 150 : tmp + Math.round(Math.random() * 10);
    temperatures.push(temp);
  }
  return temperatures;
};

const generateVoltage = (mean: number, std: number) => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();  // if outside interval ]0,1] start over
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}


const ONE_DAY = 24 * 60 * 60 * 1000;
const ONE_SEC = 1000;

export async function populateExample(
  db: Kysely<DB>,
  workspaceUser: WorkspaceUser,
) {
  const workspaceId = workspaceUser.workspaceId;

  return safeTry(async function*() {
    const product = yield* (
      await createProduct(db, {
        name: "ROBOT-ARM-PLATFORM",
        workspaceId,
        description: "Robot arm",
      })
    ).safeUnwrap();

    const pcb_ctr065 = yield* (
      await createPart(db, {
        name: "PCB-CTR065",
        workspaceId,
        productName: product.name,
        description: "Controlloer Board",
      })
    ).safeUnwrap();

    const pcb_ctr065_001 = yield* (
      await createPartVariation(db, {
        partNumber: "PCB-CTR065-001",
        description: "Medical Grade Control Board",
        market: "Medical",
        type: "PCB",
        workspaceId,
        partId: pcb_ctr065.id,
        components: [],
      })
    ).safeUnwrap();

    const pcb_ctr065_002 = yield* (
      await createPartVariation(db, {
        partNumber: "PCB-CTR065-002",
        description: "Control Board",
        market: "Industrial",
        type: "PCB",
        workspaceId,
        partId: pcb_ctr065.id,
        components: [],
      })
    ).safeUnwrap();

    const pcb_pwr065 = yield* (
      await createPart(db, {
        name: "PCB-PWR065",
        workspaceId,
        productName: product.name,
        description: "Power Board",
      })
    ).safeUnwrap();

    const pcb_pwr065_001 = yield* (
      await createPartVariation(db, {
        partNumber: "PCB-PWR065-001",
        description: "Medical Grade Power Board",
        market: "Medical",
        type: "PCB",
        workspaceId,
        partId: pcb_pwr065.id,
        components: [],
      })
    ).safeUnwrap();

    const pcb_pwr065_002 = yield* (
      await createPartVariation(db, {
        partNumber: "PCB-PWR065-002",
        description: "Power Board",
        market: "Industrial",
        type: "PCB",
        workspaceId,
        partId: pcb_pwr065.id,
        components: [],
      })
    ).safeUnwrap();

    const act_065000 = yield* (
      await createPart(db, {
        name: "ACT-065000",
        workspaceId,
        productName: product.name,
        description: "Actuator 65mm",
      })
    ).safeUnwrap();

    const act_065000_001 = yield* (
      await createPartVariation(db, {
        partNumber: "ACT-065000-001",
        description: "Medical Grade Actuator 65mm",
        market: "Medical",
        type: "ACTUATOR",
        workspaceId,
        partId: act_065000.id,
        components: [
          { partVariationId: pcb_pwr065_001.id, count: 1 },
          { partVariationId: pcb_ctr065_001.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    const act_065000_002 = yield* (
      await createPartVariation(db, {
        partNumber: "ACT-065000-002",
        description: "Actuator 65mm",
        market: "Industrial",
        type: "ACTUATOR",
        workspaceId,
        partId: act_065000.id,
        components: [
          { partVariationId: pcb_pwr065_002.id, count: 1 },
          { partVariationId: pcb_ctr065_002.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    const act_110000 = yield* (
      await createPart(db, {
        name: "ACT-110000",
        workspaceId,
        productName: product.name,
        description: "Actuator 110mm",
      })
    ).safeUnwrap();

    const act_110000_001 = yield* (
      await createPartVariation(db, {
        partNumber: "ACT-110000-001",
        description: "Medical Grade Actuator 110mm",
        market: "Medical",
        type: "ACTUATOR",
        workspaceId,
        partId: act_110000.id,
        components: [
          { partVariationId: pcb_pwr065_001.id, count: 1 },
          { partVariationId: pcb_ctr065_001.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    const act_110000_002 = yield* (
      await createPartVariation(db, {
        partNumber: "ACT-110000-002",
        description: "Actuator 110mm",
        market: "Industrial",
        type: "ACTUATOR",
        workspaceId,
        partId: act_110000.id,
        components: [
          { partVariationId: pcb_pwr065_002.id, count: 1 },
          { partVariationId: pcb_ctr065_002.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    const act_092000 = yield* (
      await createPart(db, {
        name: "ACT-092000",
        workspaceId,
        productName: product.name,
        description: "Actuator 92mm",
      })
    ).safeUnwrap();

    const act_092000_001 = yield* (
      await createPartVariation(db, {
        partNumber: "ACT-092000-001",
        description: "Medical Grade Actuator 92mm",
        market: "Medical",
        type: "ACTUATOR",
        workspaceId,
        partId: act_092000.id,
        components: [
          { partVariationId: pcb_pwr065_001.id, count: 1 },
          { partVariationId: pcb_ctr065_001.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    const act_092000_002 = yield* (
      await createPartVariation(db, {
        partNumber: "ACT-092000-002",
        description: "Actuator 92mm",
        market: "Industrial",
        type: "ACTUATOR",
        workspaceId,
        partId: act_092000.id,
        components: [
          { partVariationId: pcb_pwr065_002.id, count: 1 },
          { partVariationId: pcb_ctr065_002.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    const bs_lp1000 = yield* (
      await createPart(db, {
        name: "BS-LP1000",
        workspaceId,
        productName: product.name,
        description: "Robot Platform Base",
      })
    ).safeUnwrap();

    const bs_lp1000_001 = yield* (
      await createPartVariation(db, {
        partNumber: "BS-LP1000-001",
        description: "Medical Grade Base Platform",
        market: "Medical",
        type: "Base",
        workspaceId,
        partId: bs_lp1000.id,
        components: [],
      })
    ).safeUnwrap();

    const bs_lp1000_002 = yield* (
      await createPartVariation(db, {
        partNumber: "BS-LP1000-002",
        description: "Base Platform",
        market: "Industrial",
        type: "Base",
        workspaceId,
        partId: bs_lp1000.id,
        components: [],
      })
    ).safeUnwrap();

    const wst_lp2000 = yield* (
      await createPart(db, {
        name: "WST-LP2000",
        workspaceId,
        productName: product.name,
        description: "Robot Wrist",
      })
    ).safeUnwrap();

    const wst_lp2000_001 = yield* (
      await createPartVariation(db, {
        partNumber: "WST-LP2000-001",
        description: "Medical Grade Wrist Platform",
        market: "Medical",
        type: "Wrist",
        workspaceId,
        partId: wst_lp2000.id,
        components: [],
      })
    ).safeUnwrap();

    const wst_lp2000_002 = yield* (
      await createPartVariation(db, {
        partNumber: "WST-LP2000-002",
        description: "Wrist Platform",
        market: "Industrial",
        type: "Wrist",
        workspaceId,
        partId: wst_lp2000.id,
        components: [],
      })
    ).safeUnwrap();

    const arm_pl1000 = yield* (
      await createPart(db, {
        name: "ARM-PL1000",
        workspaceId,
        productName: product.name,
        description: "Arm Platform",
      })
    ).safeUnwrap();

    yield* (
      await createPartVariation(db, {
        partNumber: "ARM-PL1000-001",
        description: "Medical Grade Arm Platform",
        market: "Medical",
        type: "ARM",
        workspaceId,
        partId: arm_pl1000.id,
        components: [
          { partVariationId: bs_lp1000_001.id, count: 1 },
          { partVariationId: wst_lp2000_001.id, count: 1 },
          { partVariationId: act_065000_001.id, count: 1 },
          { partVariationId: act_092000_001.id, count: 1 },
          { partVariationId: act_110000_001.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    yield* (
      await createPartVariation(db, {
        partNumber: "ARM-PL1000-002",
        description: "Arm Platform",
        market: "Industrial",
        type: "ARM",
        workspaceId,
        partId: arm_pl1000.id,
        components: [
          { partVariationId: bs_lp1000_002.id, count: 1 },
          { partVariationId: wst_lp2000_002.id, count: 1 },
          { partVariationId: act_065000_002.id, count: 1 },
          { partVariationId: act_092000_002.id, count: 1 },
          { partVariationId: act_110000_002.id, count: 1 },
        ],
      })
    ).safeUnwrap();

    // ~~~ Sample Tests for Power Board ~~~

    const powerTestingPowerBoard = yield* (
      await createProject(db, {
        name: "Power Testing - PCB-CTR065-001",
        partVariationId: pcb_pwr065_001.id,
        workspaceId,
        numCycles: 1,
      })
    ).safeUnwrap();
    await db
      .insertInto("project_user")
      .values({
        projectId: powerTestingPowerBoard.id,
        userId: workspaceUser.userId,
        role: "developer",
        workspaceId: workspaceUser.workspaceId,
      })
      .executeTakeFirstOrThrow();

    const station1 = yield* (
      await createStation(db, {
        name: "Station A-01",
        projectId: powerTestingPowerBoard.id,
      })
    ).safeUnwrap();

    const station2 = yield* (
      await createStation(db, {
        name: "Station B-02",
        projectId: powerTestingPowerBoard.id,
      })
    ).safeUnwrap();


    const booleanTest = yield* (
      await createTest(db, {
        name: "Did Power On",
        projectId: powerTestingPowerBoard.id,
        measurementType: "boolean",
      })
    ).safeUnwrap();

    const scalarTest = yield* (
      await createTest(db, {
        name: "Voltage Test",
        projectId: powerTestingPowerBoard.id,
        measurementType: "scalar",
        unit: "V",
      })
    ).safeUnwrap();

    const dataframeTest = yield* (
      await createTest(db, {
        name: "Temperature Test",
        projectId: powerTestingPowerBoard.id,
        measurementType: "dataframe",
      })
    ).safeUnwrap();

    const powerBoardUnits = _.times(961, (i) => ({
      id: generateDatabaseId("unit"),
      serialNumber: `${pcb_pwr065_001.partNumber}-S${i + 1}`,
      partVariationId: pcb_pwr065_001.id,
      workspaceId,
    }));

    const powerBoards = await db
      .insertInto("unit")
      .values([...powerBoardUnits])
      .returningAll()
      .execute();


    for (let i = 0; i < powerBoards.length; i++) {
      const unit = powerBoards[i]!;
      const didPowerOn = Math.random() < 0.96;
      const sessionStartDate = new Date().getTime() - Math.round(i / 10) * ONE_DAY;
      if (didPowerOn) {
        yield* (
          await createSession(db, workspaceId, workspaceUser.userId, {
            serialNumber: unit.serialNumber,
            stationId: Math.random() < 0.66 ? station1.id : station2.id,
            notes: "This is a test session",
            integrity: true,
            aborted: false,
            measurements: [
              {
                name: "Did Power On",
                durationMs: Math.round(Math.random() * ONE_SEC * 12),
                testId: booleanTest.id,
                createdAt: new Date(sessionStartDate),
                data: { type: "boolean" as const, value: didPowerOn },
                pass: didPowerOn,
              },
            ],
            createdAt: new Date(sessionStartDate),
          })
        ).safeUnwrap();
      } else {
        const powerOnTime = Math.round(Math.random() * ONE_SEC * 2);
        const powerData = generateVoltage(5, 1);
        const powerPass = powerData > 4.2 && powerData < 5.8;
        const temperatureData = generateTemperature();
        const temperaturePass = temperatureData.filter((t) => t > 105).length === 0;
        yield* (
          await createSession(db, workspaceId, workspaceUser.userId, {
            serialNumber: unit.serialNumber,
            stationId: Math.random() < 0.72 ? station1.id : station2.id,
            notes: "This is an Example",
            integrity: true,
            aborted: false,
            measurements: [
              {
                name: "Did Power On",
                durationMs: powerOnTime,
                testId: booleanTest.id,
                createdAt: new Date(sessionStartDate),
                data: { type: "boolean" as const, value: didPowerOn },
                pass: didPowerOn,
              },
              {
                name: "Voltage Test",
                testId: scalarTest.id,
                createdAt: new Date(sessionStartDate + powerOnTime),
                durationMs: 1000,
                data: {
                  type: "scalar" as const,
                  value: powerData,
                  unit: "V",
                },
                pass: powerPass,
              },
              {
                name: "Temperature Test",
                testId: dataframeTest.id,
                createdAt: new Date(sessionStartDate + powerOnTime + 1),
                durationMs: 10000,
                data: {
                  type: "dataframe" as const,
                  value: {
                    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    y: temperatureData,
                  },
                },
                pass: temperaturePass,
              },
            ],
            createdAt: new Date(sessionStartDate),
          })
        ).safeUnwrap();
      }
    }

    return ok(undefined);
  });
}
