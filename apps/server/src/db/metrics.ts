import { DB, TimePeriod } from "@cloud/shared";
import { sql } from "kysely";
import { db } from "./kysely";
import { withStatus, withStatusUnaliased } from "./session";

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
      query = query.where(`${table}.createdAt`, ">=", start);
    }
    if (end) {
      query = query.where(`${table}.createdAt`, "<=", end);
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
      query = query.where(`${table}.createdAt`, ">=", start);
    }
    if (end) {
      query = query.where(`${table}.createdAt`, "<=", end);
    }
    return (await query.executeTakeFirstOrThrow()).count;
  };
}

export async function countSessionsOverTime(
  workspaceId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("session")
    .select((eb) => [
      // NOTE: Postgres only
      sql<Date>`DATE_TRUNC(${bin}, session.created_at)`.as("bin"),
      eb.fn.countAll<number>().as("count"),
    ])
    .innerJoin("project", "projectId", "project.id")
    .innerJoin("workspace", "workspaceId", "workspace.id")
    .where("workspaceId", "=", workspaceId)
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where(`session.createdAt`, ">=", start);
  }
  if (end) {
    query = query.where(`session.createdAt`, "<=", end);
  }

  return await query.execute();
}

export async function countUsersOverTime(
  workspaceId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("workspace_user")
    .select((eb) => [
      // NOTE: Postgres only
      sql<Date>`DATE_TRUNC(${bin}, workspace_user.created_at)`.as("bin"),
      eb.fn.countAll<number>().as("count"),
    ])
    .where("workspaceId", "=", workspaceId)
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where(`workspace_user.createdAt`, ">=", start);
  }
  if (end) {
    query = query.where(`workspace_user.createdAt`, "<=", end);
  }

  return await query.execute();
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
    query = query.where("m.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("m.createdAt", "<=", end);
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
    query = query.where("m.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("m.createdAt", "<=", end);
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
    productFailureDistribution: await productFailureDistribution(
      workspaceId,
      start,
      end,
    ),
  };
}

export async function getWorkspaceOverTimeMetrics(
  workspaceId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  return {
    sessionCountOverTime: await countSessionsOverTime(
      workspaceId,
      bin,
      start,
      end,
    ),
    userCountOverTime: await countUsersOverTime(workspaceId, bin, start, end),
  };
}

export async function projectCount(
  table: keyof Pick<DB, "session" | "project_unit">,
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

// TODO: Find a way to refactor the count over time queries
export async function countProjectSessionsOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("session")
    .select((eb) => [
      sql<Date>`DATE_TRUNC(${bin}, session.created_at)`.as("bin"),
      eb.fn.countAll<number>().as("val"),
    ])
    .where("session.projectId", "=", projectId)
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where("session.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("session.createdAt", "<=", end);
  }
  return await query.execute();
}

export async function countProjectUnitsOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("project_unit")
    .innerJoin("unit", "project_unit.unitId", "unit.id")
    .where("project_unit.projectId", "=", projectId)
    .select((eb) => [
      // FIXME: Put a created at on project_unit instead?
      sql<Date>`DATE_TRUNC(${bin}, unit.created_at)`.as("bin"),
      eb.fn.countAll<number>().as("val"),
    ])
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where("unit.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("unit.createdAt", "<=", end);
  }
  return await query.execute();
}

export async function projectMeanTestSessions(projectId: string) {
  const sessionCount = await projectCount("session", projectId);
  const unitCount = await projectCount("project_unit", projectId);

  if (unitCount === 0) return 0;

  return sessionCount / unitCount;
}

export async function projectMeanTestSessionsOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  const unitCount = await countProjectUnitsOverTime(projectId, bin, start, end);
  for (let i = 1; i < unitCount.length; i++) {
    unitCount[i].val += unitCount[i - 1].val;
  }
  const sessionCount = await countProjectSessionsOverTime(
    projectId,
    bin,
    start,
    end,
  );

  const result = [];

  let i = 0;
  for (const { bin, val } of sessionCount) {
    // Make sure we're always at the latest group of units before/same time as the session group
    while (
      i < unitCount.length - 1 &&
      unitCount[i + 1].bin.getTime() < bin.getTime()
    ) {
      i++;
    }

    if (unitCount[i].val === 0) {
      result.push({ bin, val: 0 });
    } else {
      result.push({
        bin,
        val: val / unitCount[i].val,
      });
    }
  }

  return result;
}

export async function sessionCountWithStatus(
  projectId: string,
  status: boolean | null,
) {
  const sessions = await db
    .selectFrom("session")
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .where("session.projectId", "=", projectId)
    .where("session.aborted", "=", false)
    .where((eb) => withStatusUnaliased(eb), "=", status)
    .executeTakeFirstOrThrow();
  return sessions.count;
}

export async function sessionCountWithStatusOverTime(
  projectId: string,
  bin: TimePeriod,
  status: boolean | null,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("session")
    .select((eb) => [
      sql<Date>`DATE_TRUNC(${bin}, session.created_at)`.as("bin"),
      eb.fn.countAll<number>().as("val"),
    ])
    .where("session.projectId", "=", projectId)
    .where("session.aborted", "=", false)
    .where((eb) => withStatusUnaliased(eb), "=", status)
    .groupBy("bin")
    .orderBy("bin");
  if (start) {
    query = query.where("session.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("session.createdAt", "<=", end);
  }
  return await query.execute();
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

export async function abortedSessionCountOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("session")
    .select((eb) => [
      sql<Date>`DATE_TRUNC(${bin}, session.created_at)`.as("bin"),
      eb.fn.countAll<number>().as("val"),
    ])
    .where("session.projectId", "=", projectId)
    .where("session.aborted", "=", true)
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where("session.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("session.createdAt", "<=", end);
  }
  return await query.execute();
}

export async function meanCycleTime(projectId: string) {
  const res = await db
    .with("cycle_averages", (db) =>
      db
        .selectFrom("session")
        .where("session.projectId", "=", projectId)
        .innerJoin("measurement", "session.id", "measurement.sessionId")
        .select(
          sql`SUM(measurement.duration_ms) / (MAX(COALESCE(measurement.cycle_number, 0)) + 1)`.as(
            "avgCycleTime",
          ),
        )
        .groupBy("measurement.sessionId"),
    )
    .selectFrom("cycle_averages")
    .select((eb) => eb.fn.avg<number>("avgCycleTime").as("avg"))
    .executeTakeFirstOrThrow();

  return res.avg;
}

export async function meanCycleTimeOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .with("cycle_averages", (db) =>
      db
        .selectFrom("session")
        .where("session.projectId", "=", projectId)
        .innerJoin(
          (eb) =>
            eb
              .selectFrom("measurement")
              .select([
                "measurement.sessionId",
                sql`SUM(measurement.duration_ms) / (MAX(COALESCE(measurement.cycle_number, 0)) + 1)`.as(
                  "avgCycleTime",
                ),
              ])
              .groupBy("measurement.sessionId")
              .as("cycles"),
          (join) => join.onRef("cycles.sessionId", "=", "session.id"),
        )
        .select(["session.createdAt", "cycles.avgCycleTime"]),
    )
    .selectFrom("cycle_averages")
    .select((eb) => [
      sql<Date>`DATE_TRUNC(${bin}, cycle_averages.created_at)`.as("bin"),
      eb.fn.avg<number>("avgCycleTime").as("val"),
    ])
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where("cycle_averages.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("cycle_averages.createdAt", "<=", end);
  }
  return await query.execute();
}

export async function averageSessionTime(projectId: string) {
  const res = await db
    .selectFrom("session")
    .where("session.projectId", "=", projectId)
    .select((eb) => eb.fn.avg<number>("durationMs").as("avg"))
    .executeTakeFirstOrThrow();
  return res.avg;
}

export async function averageSessionTimeOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("session")
    .where("session.projectId", "=", projectId)
    .select((eb) => [
      sql<Date>`DATE_TRUNC(${bin}, session.created_at)`.as("bin"),
      eb.fn.avg<number>("durationMs").as("val"),
    ])
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where("session.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("session.createdAt", "<=", end);
  }
  return await query.execute();
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

export async function totalFailedTestTimeOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  let query = db
    .selectFrom("measurement")
    .where("projectId", "=", projectId)
    .where("pass", "=", false)
    .select((eb) => [
      sql<Date>`DATE_TRUNC(${bin}, measurement.created_at)`.as("bin"),
      eb.fn.sum<number>("durationMs").as("val"),
    ])
    .groupBy("bin")
    .orderBy("bin");

  if (start) {
    query = query.where("measurement.createdAt", ">=", start);
  }
  if (end) {
    query = query.where("measurement.createdAt", "<=", end);
  }
  return await query.execute();
}

export async function firstPassYield(projectId: string) {
  const res = await db
    .with("first", (db) =>
      db
        .selectFrom("session")
        .innerJoin(
          (eb) =>
            eb
              .selectFrom("session")
              .select((eb) => [
                "unitId",
                eb.fn.min("createdAt").as("createdAt"),
              ])
              .where("projectId", "=", projectId)
              .groupBy("unitId")
              .as("first_sessions"),
          (join) =>
            join
              .onRef("first_sessions.unitId", "=", "session.unitId")
              .onRef("first_sessions.createdAt", "=", "session.createdAt"),
        )
        .select((eb) => withStatus(eb)),
    )
    .selectFrom("first")
    .select(
      sql<number>`COALESCE(COUNT(CASE WHEN status = true THEN 1 ELSE NULL END) / NULLIF(SUM(COUNT(*)) OVER (), 0), 0)`.as(
        "firstPassYield",
      ),
    )
    .executeTakeFirstOrThrow();

  return res.firstPassYield;
}

export async function firstPassYieldOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  const res = await db
    .with("first", (db) =>
      db
        .selectFrom("session")
        .innerJoin(
          (eb) => {
            let query = eb
              .selectFrom("session")
              .select((eb) => [
                "unitId",
                eb.fn.min("createdAt").as("createdAt"),
              ])
              .where("projectId", "=", projectId)
              .groupBy("unitId");
            if (start) {
              query = query.where("createdAt", ">=", start);
            }
            if (end) {
              query = query.where("createdAt", "<=", end);
            }
            return query.as("first_sessions");
          },
          (join) =>
            join
              .onRef("first_sessions.unitId", "=", "session.unitId")
              .onRef("first_sessions.createdAt", "=", "session.createdAt"),
        )
        .select((eb) => [
          sql<Date>`DATE_TRUNC(${bin}, session.created_at)`.as("bin"),
          withStatus(eb),
        ]),
    )
    .selectFrom("first")
    .select([
      "bin",
      sql<number>`COALESCE(COUNT(CASE WHEN status = true THEN 1 ELSE NULL END) / NULLIF(SUM(COUNT(*)) OVER (), 0), 0)`.as(
        "val",
      ),
    ])
    .groupBy("bin")
    .orderBy("bin")
    .execute();

  return res;
}

export async function testYield(projectId: string) {
  const passCount = await sessionCountWithStatus(projectId, true);
  const sessionCount = await projectCount("session", projectId);

  if (sessionCount === 0) return 0;

  return passCount / sessionCount;
}

export async function testYieldOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  const [passCount, sessionCount] = await Promise.all([
    sessionCountWithStatusOverTime(projectId, bin, true, start, end),
    countProjectSessionsOverTime(projectId, bin, start, end),
  ]);

  let i = 0;
  const result = [];
  // passCount must necessarily be sparser than sessionCount
  for (const { bin, val } of sessionCount) {
    if (i >= passCount.length || passCount[i].bin.getTime() !== bin.getTime()) {
      result.push({ bin, val: 0 });
    } else {
      result.push({ bin, val: passCount[i].val / val });
      i++;
    }
  }

  return result;
}

export async function getProjectMetrics(projectId: string) {
  const [
    testSessionCountRes,
    unitCountRes,
    meanSessionsPerUnitRes,
    sessionPassedCountRes,
    sessionFailedCountRes,
    sessionAbortedCountRes,
    meanCycleTimeRes,
    meanSessionTimeRes,
    totalFailedTestTimeRes,
    firstPassYieldRes,
    testYieldRes,
  ] = await Promise.all([
    projectCount("session", projectId),
    projectCount("project_unit", projectId),
    projectMeanTestSessions(projectId),
    sessionCountWithStatus(projectId, true),
    sessionCountWithStatus(projectId, false),
    abortedSessionCount(projectId),
    meanCycleTime(projectId),
    averageSessionTime(projectId),
    totalFailedTestTime(projectId),
    firstPassYield(projectId),
    testYield(projectId),
  ]);

  return {
    testSessionCount: testSessionCountRes,
    unitCount: unitCountRes,
    meanSessionsPerUnit: meanSessionsPerUnitRes,
    sessionPassedCount: sessionPassedCountRes,
    sessionFailedCount: sessionFailedCountRes,
    sessionAbortedCount: sessionAbortedCountRes,
    meanCycleTime: meanCycleTimeRes,
    meanSessionTime: meanSessionTimeRes,
    totalFailedTestTime: totalFailedTestTimeRes,
    firstPassYield: firstPassYieldRes,
    testYield: testYieldRes,
  };
}

export async function getProjectMetricsOverTime(
  projectId: string,
  bin: TimePeriod,
  start: Date | undefined,
  end: Date | undefined,
) {
  const [
    testSessionCount,
    unitCount,
    meanSessionsPerUnit,
    sessionPassedCount,
    sessionFailedCount,
    sessionAbortedCount,
    meanCycleTime,
    meanSessionTime,
    totalFailedTestTime,
    firstPassYield,
    testYield,
  ] = await Promise.all([
    countProjectSessionsOverTime(projectId, bin, start, end),
    countProjectUnitsOverTime(projectId, bin, start, end),
    projectMeanTestSessionsOverTime(projectId, bin, start, end),
    sessionCountWithStatusOverTime(projectId, bin, true, start, end),
    sessionCountWithStatusOverTime(projectId, bin, false, start, end),
    abortedSessionCountOverTime(projectId, bin, start, end),
    meanCycleTimeOverTime(projectId, bin, start, end),
    averageSessionTimeOverTime(projectId, bin, start, end),
    totalFailedTestTimeOverTime(projectId, bin, start, end),
    firstPassYieldOverTime(projectId, bin, start, end),
    testYieldOverTime(projectId, bin, start, end),
  ]);

  return {
    testSessionCount,
    unitCount,
    meanSessionsPerUnit,
    sessionPassedCount,
    sessionFailedCount,
    sessionAbortedCount,
    meanCycleTime,
    meanSessionTime,
    totalFailedTestTime,
    firstPassYield,
    testYield,
  };
}

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
