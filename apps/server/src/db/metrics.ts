import { DB } from "@cloud/shared";
import { sql } from "kysely";
import _ from "lodash/fp";
import { Result, err, ok } from "neverthrow";
import { BadRequestError, NotFoundError } from "../lib/error";
import { median, mode } from "../lib/stats";
import { countWhere } from "../lib/utils";
import { db } from "./kysely";
import { getTestMeasurements } from "./measurement";
import { withStatus } from "./session";
import { getTest } from "./test";

export function workspaceCounter(
  workspaceId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  return async (
    table: keyof Pick<DB, "part_variation" | "unit" | "workspace_user">,
  ) => {
    let query = db
      .selectFrom(table)
      .where("workspaceId", "=", workspaceId)
      .select((eb) => eb.fn.countAll<number>().as("count"));
    if (start) {
      query = query.where("createdAt", ">=", start);
    }
    if (end) {
      query = query.where("createdAt", "<=", end);
    }
    return (await query.executeTakeFirstOrThrow()).count;
  };
}

export function workspaceProjectResourceCounter(
  workspaceId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  return async (table: keyof Pick<DB, "session" | "measurement">) => {
    let query = db
      .selectFrom(table)
      .innerJoin("project", "projectId", "project.id")
      .innerJoin("workspace", "workspaceId", "workspace.id")
      .where("project.workspaceId", "=", workspaceId)
      .select((eb) => eb.fn.countAll<number>().as("count"));
    if (start) {
      query = query.where("createdAt", ">=", start);
    }
    if (end) {
      query = query.where("createdAt", "<=", end);
    }
    return (await query.executeTakeFirstOrThrow()).count;
  };
}

export function countOverTime(
  workspaceId: string,
  bin: "day" | "week" | "month" | "year",
  start: Date | undefined,
  end: Date | undefined,
) {
  return async (table: "session" | "workspace_user") => {
    let query = db
      .selectFrom(table)
      .select((eb) => [
        // NOTE: Postgres only
        sql<Date>`DATE_TRUNC(${bin}, createdAt)`.as("bin"),
        eb.fn.countAll<number>().as("count"),
      ])
      .$if(table === "session", (qb) =>
        qb
          .innerJoin("project", "projectId", "project.id")
          .innerJoin("workspace", "workspaceId", "workspace.id"),
      )
      .where("workspaceId", "=", workspaceId)
      .groupBy("bin")
      .orderBy("bin");

    if (start) {
      query = query.where("createdAt", ">=", start);
    }
    if (end) {
      query = query.where("createdAt", "<=", end);
    }

    return await query.execute();
  };
}

export async function partVariationFailureDistribution(
  workspaceId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("measurement as m")
    .innerJoin("unit as u", "m.unitId", "u.id")
    .innerJoin("part_variation as pv", "u.partVariationId", "pv.id")
    .where("pv.workspaceId", "=", workspaceId)
    .where("m.pass", "=", false)
    .groupBy("pv.id")
    .select((eb) => ["pv.partNumber", eb.fn.countAll<number>().as("count")]);
  if (start) {
    query = query.where("createdAt", ">=", start);
  }
  if (end) {
    query = query.where("createdAt", "<=", end);
  }
  return await query.execute();
}

export async function productFailureDistribution(
  workspaceId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("measurement as m")
    .innerJoin("unit as u", "m.unitId", "u.id")
    .innerJoin("part_variation as pv", "u.partVariationId", "pv.id")
    .innerJoin("part as p", "pv.partId", "p.id")
    .innerJoin("product", "p.productId", "product.id")
    .where("product.workspaceId", "=", workspaceId)
    .where("m.pass", "=", false)
    .groupBy("product.id")
    .select((eb) => ["product.name", eb.fn.countAll<number>().as("count")]);
  if (start) {
    query = query.where("createdAt", ">=", start);
  }
  if (end) {
    query = query.where("createdAt", "<=", end);
  }
  return await query.execute();
}

export async function getWorkspaceMetrics(
  workspaceId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  const workspaceCount = workspaceCounter(workspaceId, start, end);
  const workspaceProjectCount = workspaceProjectResourceCounter(
    workspaceId,
    start,
    end,
  );
  return {
    // testSessionCount: 0,
    // measurementCount: 0,
    // partVariationCount: 0,
    // unitCount: 0,
    // userCount: 0,
    // partVariationFailureDistribution: 0,
    productFailureDistribution: 0,
    testSessionCount: await workspaceProjectCount("session"),
    measurementCount: await workspaceProjectCount("measurement"),
    partVariationCount: await workspaceCount("part_variation"),
    unitCount: await workspaceCount("unit"),
    userCount: await workspaceCount("workspace_user"),
    partVariationFailureDistribution: await partVariationFailureDistribution(
      workspaceId,
      start,
      end,
    ),
    // productFailureDistribution: await productFailureDistribution(
    //   workspaceId,
    //   start,
    //   end,
    // ),
  };
}

export async function getWorkspaceOverTimeMetrics(
  workspaceId: string,
  bin: "day" | "week" | "month" | "year",
  start: Date | undefined,
  end: Date | undefined,
) {
  const counter = countOverTime(workspaceId, bin, start, end);
  return {
    sessionCountOverTime: await counter("session"),
    userCountOverTime: await counter("workspace_user"),
  };
}

export async function projectCount(
  table: keyof Pick<DB, "session" | "unit">,
  projectId: string,
) {
  return (
    await db
      .selectFrom(table)
      .where("projectId", "=", projectId)
      .select((eb) => eb.fn.countAll<number>().as("count"))
      .executeTakeFirstOrThrow()
  ).count; //countAll always returns something
}

export async function projectMeanTestSessions(projectId: string) {
  const sessionCount = await projectCount("session", projectId);
  const unitCount = await projectCount("unit", projectId);
  return sessionCount / unitCount;
}

// TODO: Do this purely in SQL
export async function sessionCountWithStatus(
  projectId: string,
  status: boolean | null,
) {
  const sessions = await db
    .selectFrom("session")
    .select((eb) => withStatus(eb))
    .where("projectId", "=", projectId)
    .execute();

  return countWhere(sessions, (s) => s.status === status);
}

export async function abortedSessionCount(projectId: string) {
  const res = await db
    .selectFrom("session")
    .where("projectId", "=", projectId)
    .where("aborted", "=", true)
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();

  return res.count;
}

export async function meanCycleTime(projectId: string) {
  const res = await db
    .with("cycle_averages", (db) =>
      db
        .selectFrom("session")
        .where("projectId", "=", projectId)
        .innerJoin("measurement", "session.id", "measurement.sessionId")
        .select(
          sql`session.duration_ms / (MAX(measurement.cycle_number) + 1)`.as(
            "avgCycleTime",
          ),
        )
        .groupBy("sessionId"),
    )
    .selectFrom("cycle_averages")
    .select((eb) => eb.fn.avg<number>("avgCycleTime").as("avg"))
    .executeTakeFirstOrThrow();

  return res.avg;
}

export async function averageSessionTime(projectId: string) {
  return await db
    .selectFrom("session")
    .where("projectId", "=", projectId)
    .select((eb) => eb.fn.avg<number>("durationMs").as("avg"))
    .executeTakeFirstOrThrow();
}

export async function totalFailedTestTime(projectId: string) {
  const res = await db
    .selectFrom("measurement")
    .where("projectId", "=", projectId)
    .where("pass", "=", false)
    .select((eb) => eb.fn.sum<number>("durationMs").as("sum"))
    .executeTakeFirstOrThrow();

  return res.sum;
}

export async function firstPassYield(projectId: string) {
  const firstSessions = await db
    .selectFrom("session")
    .select((eb) => [withStatus(eb), eb.fn.min("createdAt").as("createdAt")])
    .where("projectId", "=", projectId)
    .groupBy("unitId")
    .execute();
  return (
    countWhere(firstSessions, (s) => s.status === true) / firstSessions.length
  );
}

export async function testYield(projectId: string) {
  const passCount = await sessionCountWithStatus(projectId, true);
  const sessionCount = await projectCount("session", projectId);
  return passCount / sessionCount;
}

export async function getProjectMetrics(projectId: string) {
  return {
    testSessionCount: await projectCount("session", projectId),
    unitCount: await projectCount("unit", projectId),
    meanSessionsPerUnit: await projectMeanTestSessions(projectId),
    sessionPassedCount: await sessionCountWithStatus(projectId, true),
    sessionFailedCount: await sessionCountWithStatus(projectId, false),
    sessionAbortedCount: await abortedSessionCount(projectId),
    meanCycleTime: await meanCycleTime(projectId),
    meanSessionTime: await averageSessionTime(projectId),
    totalFailedTestTime: await totalFailedTestTime(projectId),
    firstPassYield: await firstPassYield(projectId),
    testYield: await testYield(projectId),
  };
}

export async function getTestDistribution(
  testId: string,
): Promise<Result<number[], NotFoundError | BadRequestError>> {
  const test = await getTest(db, testId);
  if (test === undefined) {
    return err(new NotFoundError("Test not found"));
  }
  if (test.measurementType !== "scalar") {
    return err(
      new BadRequestError("Can't get distribution for non-scalar test"),
    );
  }
  const measurements = await getTestMeasurements(db, testId);
  return ok(measurements.map((m) => m.data.value as number));
}

function testStatistic<T>(compute: (nums: number[]) => T) {
  return async (testId: string) => {
    return (await getTestDistribution(testId)).map(compute);
  };
}

export const testMean = testStatistic(_.mean);
export const testMedian = testStatistic(median);
export const testMode = testStatistic(mode);
export const testMax = testStatistic(_.max);
export const testMin = testStatistic(_.min);

export async function unitFailureDistribution(
  partVariationId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("measurement as m")
    .innerJoin("unit as u", "m.unitId", "u.id")
    .where("u.partVariationId", "=", partVariationId)
    .where("m.pass", "=", false)
    .groupBy("u.id")
    .select((eb) => ["u.serialNumber", eb.fn.countAll<number>().as("count")]);
  if (start) {
    query = query.where("createdAt", ">=", start);
  }
  if (end) {
    query = query.where("createdAt", "<=", end);
  }
  return await query.execute();
}
