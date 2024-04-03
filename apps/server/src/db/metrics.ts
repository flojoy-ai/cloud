import { DB } from "@cloud/shared";
import { db } from "./kysely";
import { withStatus } from "./session";
import { countWhere } from "../lib/utils";

export function workspaceCounter(
  workspaceId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  return async (
    table: keyof Pick<
      DB,
      "session" | "part_variation" | "unit" | "workspace_user"
    >,
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
    return (await query.executeTakeFirst())!.count;
  };
}

export async function getWorkspaceMetrics(
  workspaceId: string,
  start: Date | undefined,
  end: Date | undefined,
) {
  const workspaceCount = workspaceCounter(workspaceId, start, end);
  return {
    testSessionCount: await workspaceCount("session"),
    partVariationCount: await workspaceCount("part_variation"),
    unitCount: await workspaceCount("unit"),
    userCount: await workspaceCount("workspace_user"),
  };
}

export async function projectCount(
  table: keyof Pick<DB, "session" | "unit">,
  projectId: string,
) {
  return (await db
    .selectFrom(table)
    .where("projectId", "=", projectId)
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirst())!.count; //countAll always returns something
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
  return (await db
    .selectFrom("session")
    .where("projectId", "=", projectId)
    .where("aborted", "=", true)
    .select((eb) => eb.fn.countAll<number>().as("count"))
    .executeTakeFirst())!.count;
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
    firstPassYield: await firstPassYield(projectId),
    testYield: await testYield(projectId),
  };
}
