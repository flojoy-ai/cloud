import {
  DB,
  InsertSession,
  InsertTest,
  MeasurementData,
  Session,
  WorkspaceUser,
} from "@cloud/shared";
import { ExpressionBuilder, Kysely, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import _ from "lodash";
import { Result, err, ok } from "neverthrow";
import { generateDatabaseId, tryQuery } from "../lib/db-utils";
import { DBError, InternalServerError, NotFoundError } from "../lib/error";
import { errIfUndefined } from "../lib/utils";
import { db } from "./kysely";
import { createMeasurement } from "./measurement";
import { getStation } from "./station";
import { createTest, getTestByName } from "./test";
import { getUnitBySerialNumber } from "./unit";

export async function getSessionsByUnitId(
  unitId: string,
  workspaceUser: WorkspaceUser,
) {
  return await db
    .selectFrom("session")
    .selectAll("session")
    .innerJoin("project_user as pu", (join) =>
      join
        .on("pu.workspaceId", "=", workspaceUser.workspaceId)
        .onRef("pu.projectId", "=", "session.projectId")
        .on("pu.userId", "=", workspaceUser.userId),
    )
    .select((eb) => withStatus(eb))
    .innerJoin("user", "user.id", "session.userId")
    .select("user.email as userEmail")
    .where("session.unitId", "=", unitId)
    .execute();
}

export async function getSessionsByStation(
  stationId: string,
  workspaceUser: WorkspaceUser,
) {
  return await db
    .selectFrom("session")
    .selectAll("session")
    .innerJoin("project_user as pu", (join) =>
      join
        .on("pu.workspaceId", "=", workspaceUser.workspaceId)
        .onRef("pu.projectId", "=", "session.projectId")
        .on("pu.userId", "=", workspaceUser.userId),
    )
    .select((eb) => withStatus(eb))
    .innerJoin("user", "user.id", "session.userId")
    .select("user.email as userEmail")
    .where("stationId", "=", stationId)
    .execute();
}

export async function getSessionsByProject(
  projectId: string,
  workspaceUser: WorkspaceUser,
) {
  return await db
    .selectFrom("session")
    .selectAll("session")
    .innerJoin("project_user as pu", (join) =>
      join
        .on("pu.workspaceId", "=", workspaceUser.workspaceId)
        .onRef("pu.projectId", "=", "session.projectId")
        .on("pu.userId", "=", workspaceUser.userId),
    )
    .select((eb) => withStatus(eb))
    .innerJoin("user", "user.id", "session.userId")
    .select("user.email as userEmail")
    .where("session.projectId", "=", projectId)
    .execute();
}

// FIXME: Kysely says the type of measurement.createdAt is Date,
// but it's actually a string. Bit confusing for frontend...
// See: https://github.com/kysely-org/kysely/issues/482
export function withSessionMeasurements(eb: ExpressionBuilder<DB, "session">) {
  return jsonArrayFrom(
    eb
      .selectFrom("measurement")
      .selectAll("measurement")
      .whereRef("measurement.sessionId", "=", "session.id")
      .$narrowType<{ data: MeasurementData }>(),
  ).as("measurements");
}

export function withStatusUnaliased(eb: ExpressionBuilder<DB, "session">) {
  return (
    eb
      .selectFrom("measurement as m")
      // TODO: Write this with kysely
      .select(
        sql<boolean | null>`
      CASE
        WHEN COUNT(CASE WHEN m.pass = false THEN 1 END) > 0 THEN false
        WHEN COUNT(CASE WHEN m.pass IS NULL then 1 END) > 0 THEN NULL
        ELSE true
      END
`.as("pass"),
      )
      .whereRef("m.sessionId", "=", "session.id")
  );
}

export function withStatus(eb: ExpressionBuilder<DB, "session">) {
  return withStatusUnaliased(eb).as("status");
}

export async function getSession(db: Kysely<DB>, sessionId: string) {
  return await db
    .selectFrom("session")
    .selectAll("session")
    .select((eb) => withSessionMeasurements(eb))
    .select((eb) => withStatus(eb))
    .innerJoin("user", "user.id", "session.userId")
    .select("user.email as userEmail")
    .where("session.id", "=", sessionId)
    .executeTakeFirst();
}

export async function createSession(
  db: Kysely<DB>,
  workspaceId: string,
  userId: string,
  input: InsertSession,
): Promise<Result<Session, DBError>> {
  const { measurements, ...body } = input;

  const station = await getStation(db, body.stationId);
  if (station === undefined) {
    return err(new NotFoundError("Station not found"));
  }

  const unit = await getUnitBySerialNumber(db, body.serialNumber, workspaceId);
  if (unit === undefined) {
    return err(
      new NotFoundError(`Serial Number ${body.serialNumber} not found`),
    );
  }

  // create the association if it doesn't exist already
  await db
    .insertInto("project_unit")
    .values({
      projectId: station.projectId,
      unitId: unit.id,
    })
    .onConflict((oc) => oc.doNothing())
    .execute();

  const totalTime = _.sumBy(measurements, (m) => m.durationMs);

  const toInsert = {
    unitId: unit.id,
    userId: userId,
    projectId: station.projectId,
    stationId: body.stationId,
    integrity: body.integrity,
    aborted: body.aborted,
    notes: body.notes,
    commitHash: body.commitHash,
    durationMs: totalTime,
    createdAt: body.createdAt,
  };

  const res = await tryQuery(
    db
      .insertInto("session")
      .values({
        id: generateDatabaseId("session"),
        ...toInsert,
      })
      .returningAll()
      .executeTakeFirst(),
  ).andThen(
    errIfUndefined(new InternalServerError("Failed to create session")),
  );
  if (res.isErr()) return res;

  const session = res.value;

  for (const meas of measurements) {
    // NOTE: TestId should be provided in the DS
    let test = await getTestByName(db, meas.name, station.projectId);

    if (test === undefined) {
      const payload: InsertTest = {
        name: meas.name,
        projectId: station.projectId,
        measurementType: meas.data.type,
      };
      if (meas.data.type === "scalar" && payload.measurementType === "scalar") {
        payload.unit = meas.data.unit;
      }

      const testResult = await createTest(db, payload);

      if (testResult.isErr())
        return err(new InternalServerError(testResult.error));

      test = testResult.value;
    }

    await createMeasurement(db, workspaceId, {
      ...meas,
      sessionId: session.id,
      testId: test.id,
      unitId: unit.id,
      projectId: station.projectId,
      tagNames: [],
    });
  }

  return ok(session);
}
