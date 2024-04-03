import Elysia, { t } from "elysia";
import { getProjectMetrics, getWorkspaceMetrics } from "../db/metrics";
import { getPastStartTime, pastTimePeriod } from "../lib/time";
import { WorkspaceMiddleware } from "../middlewares/workspace";

export const timeFilterQueryParams = t.Object({
  past: pastTimePeriod,
  from: t.Optional(t.Date()),
  to: t.Optional(t.Date()),
});

export const MetricsRoute = new Elysia({ prefix: "/part" })
  .use(WorkspaceMiddleware)
  .get(
    "/workspace",
    async ({ workspace, query: { past, from, to } }) => {
      const start = from ?? (past ? getPastStartTime(past) : undefined);
      const end = to;
      return getWorkspaceMetrics(workspace.id, start, end);
    },
    { query: timeFilterQueryParams },
  )
  .get(
    "/project/:projectId",
    async ({ params: { projectId } }) => {
      return getProjectMetrics(projectId);
    },
    { query: timeFilterQueryParams },
  );
