import { TimePeriod, timeFilterQueryParams, timePeriod } from "@cloud/shared";
import { Elysia, t } from "elysia";
import {
  countSessionsOverTime,
  countUsersOverTime,
  getProjectMetrics,
  getProjectMetricsOverTime,
  getWorkspaceMetrics,
} from "../db/metrics";
import { checkProjectPerm } from "../lib/perm/project";
import { getPastStartTime } from "../lib/time";
import { WorkspaceMiddleware } from "../middlewares/workspace";

const getStartTime = (past: TimePeriod | undefined, from: Date | undefined) =>
  from ?? (past ? getPastStartTime(past) : undefined);

export const MetricsRoute = new Elysia({
  prefix: "/metrics",
  name: "MetricsRoute",
})
  .use(WorkspaceMiddleware)
  .group("/workspace", (app) =>
    app
      .get(
        "/",
        async ({ log, workspace, query: { past, from, to } }) => {
          const start = getStartTime(past, from);
          const end = to;
          log.info("Start: ", start);
          return getWorkspaceMetrics(workspace.id, start, end);
        },
        { query: timeFilterQueryParams },
      )
      .get(
        "/series/session",
        async ({ log, workspace, query: { past, bin, from, to } }) => {
          const start = getStartTime(past, from);
          const end = to;
          log.info("Start: ", start);
          return await countSessionsOverTime(workspace.id, bin, start, end);
        },
        {
          query: t.Composite([
            timeFilterQueryParams,
            t.Object({ bin: timePeriod }),
          ]),
        },
      )
      .get(
        "/series/user",
        async ({ workspace, query: { past, bin, from, to } }) => {
          const start = getStartTime(past, from);
          const end = to;
          return await countUsersOverTime(workspace.id, bin, start, end);
        },
        {
          query: t.Composite([
            timeFilterQueryParams,
            t.Object({ bin: timePeriod }),
          ]),
        },
      ),
  )
  .group("/project/:projectId", (app) =>
    app
      .get(
        "/",
        async ({ params: { projectId } }) => {
          return getProjectMetrics(projectId);
        },
        {
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
      )
      .get(
        "/series",
        async ({ params: { projectId }, query: { bin } }) => {
          return getProjectMetricsOverTime(projectId, bin);
        },
        {
          query: t.Object({ bin: timePeriod }),
        },
      ),
  );
