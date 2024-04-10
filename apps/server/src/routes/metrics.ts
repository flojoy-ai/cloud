import { Elysia, t } from "elysia";
import {
  countSessionsOverTime,
  countUsersOverTime,
  getProjectMetrics,
  getWorkspaceMetrics,
} from "../db/metrics";
import { getPastStartTime } from "../lib/time";
import { WorkspaceMiddleware } from "../middlewares/workspace";
import { checkProjectPerm } from "../lib/perm/project";
import { TimePeriod, timeFilterQueryParams, timePeriod } from "@cloud/shared";

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
        async ({ workspace, query: { past, from, to } }) => {
          const start = getStartTime(past, from);
          const end = to;
          return getWorkspaceMetrics(workspace.id, start, end);
        },
        { query: timeFilterQueryParams },
      )
      .get(
        "/series/session",
        async ({ workspace, query: { past, bin, from, to } }) => {
          const start = getStartTime(past, from);
          const end = to;
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
