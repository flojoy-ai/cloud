import { ExpressionBuilder, Kysely, sql } from "kysely";
import { fromTransaction, generateDatabaseId, tryQuery } from "../lib/db-utils";
import { Result, ResultAsync, err, fromPromise, ok } from "neverthrow";
import {
  DB,
  InsertSession,
  Session,
  SessionMeasurement,
  Workspace,
} from "@cloud/shared";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { db } from "./kysely";
import { DBError, InternalServerError, NotFoundError } from "../lib/error";
import { errIfUndefined } from "../lib/utils";
import { getStation } from "./station";
import { getUnitBySerialNumber } from "./unit";
import { createTest, getTestByName } from "./test";
import { createMeasurement } from "./measurement";
import { User } from "lucia";

export async function getSessionsByUnit(unitId: string) {
  return await db
    .selectFrom("session")
    .selectAll()
    .select((eb) => withStatus(eb))
    .where("unitId", "=", unitId)
    .execute();
}

export async function getSessionsByStation(stationId: string) {
  return await db
    .selectFrom("session")
    .selectAll()
    .select((eb) => withStatus(eb))
    .where("stationId", "=", stationId)
    .execute();
}

export async function getSessionsByProject(projectId: string) {
  return await db
    .selectFrom("session")
    .selectAll()
    .select((eb) => withStatus(eb))
    .where("projectId", "=", projectId)
    .execute();
}

export function withSessionMeasurements(eb: ExpressionBuilder<DB, "session">) {
  return jsonArrayFrom(
    eb
      .selectFrom("measurement")
      .selectAll("measurement")
      .whereRef("measurement.sessionId", "=", "session.id"),
  ).as("measurements");
}

export function withStatus(eb: ExpressionBuilder<DB, "session">) {
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
      .as("status")
  );
}

export async function getSession(db: Kysely<DB>, sessionId: string) {
  return await db
    .selectFrom("session")
    .selectAll("session")
    .select((eb) => withSessionMeasurements(eb))
    .select((eb) => withStatus(eb))
    .where("session.id", "=", sessionId)
    .executeTakeFirst();
}

export async function createSession(
  db: Kysely<DB>,
  workspaceId: string,
  input: InsertSession,
  user?: User,
): Promise<Result<Session, DBError>> {
  const { measurements, ...body } = input;

  const station = await getStation(db, body.stationId);
  if (station === undefined) {
    return err(new NotFoundError("Station not found"));
  }

  const unit = await getUnitBySerialNumber(db, body.serialNumber);
  if (unit === undefined) {
    return err(
      new NotFoundError(`Serial Number ${body.serialNumber} not found`),
    );
  }

  const toInsert = {
    unitId: unit.id,
    projectId: station.projectId,
    userId: user?.id,
    ...body,
  };

  return fromTransaction(async (tx) => {
    const res = await tryQuery(
      tx
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
      let test = await getTestByName(db, meas.name);
      if (test === undefined) {
        const testResult = await createTest(db, {
          name: meas.name,
          projectId: station.projectId,
          measurementType: meas.data.type,
        });
        if (testResult.isErr()) {
          return err(new InternalServerError(testResult.error));
        }
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
  });
}
