import { Elysia, t } from "elysia";
import {
  getProjectMetrics,
  getWorkspaceMetrics,
  getWorkspaceOverTimeMetrics,
} from "../db/metrics";
import { getPastStartTime } from "../lib/time";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkProjectPerm } from "../lib/perm/project";
import { timeFilterQueryParams, timePeriod } from "@cloud/shared";

export const MetricsRoute = new Elysia({
  prefix: "/metrics",
  name: "MetricsRoute",
})
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
    "/workspace/series",
    async ({ workspace, query: { past, bin, from, to } }) => {
      const start = from ?? (past ? getPastStartTime(past) : undefined);
      const end = to;

      return getWorkspaceOverTimeMetrics(workspace.id, bin, start, end);
    },
    {
      query: t.Composite([
        timeFilterQueryParams,
        t.Object({ bin: timePeriod }),
      ]),
    },
  )
  .get(
    "/project/:projectId",
    async ({ params: { projectId } }) => {
      return getProjectMetrics(projectId);
    },
    {
      query: timeFilterQueryParams,
      async beforeHandle({ params: { projectId }, workspaceUser, error }) {
        const perm = await checkProjectPerm({
          projectId,
          workspaceUser,
        });

        return perm.match(
          (perm) => (perm.canRead() ? undefined : error("Forbidden")),
          (err) => error(403, err),
        );
      },
    },
  );
