import { TimePeriod, timeFilterQueryParams, timePeriod } from "@cloud/shared";
import { faker } from "@faker-js/faker";
import { Elysia, t } from "elysia";
import _ from "lodash";
import {
  getProjectMetrics,
  getProjectMetricsOverTime,
  getWorkspaceMetrics,
} from "../db/metrics";
import { checkProjectPerm } from "../lib/perm/project";
import { getPastStartTime } from "../lib/time";
import { WorkspaceMiddleware } from "../middlewares/workspace";

const getStartTime = (past: TimePeriod | undefined, from: Date | undefined) =>
  from ?? (past ? getPastStartTime(past) : undefined);

const truncateDate = (date: Date, bin: TimePeriod) => {
  switch (bin) {
    case "day":
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case "week":
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case "month":
      return new Date(date.getFullYear(), date.getMonth());
    case "year":
      return new Date(date.getFullYear(), 0);
  }
};

const fakeTimeSeries = (bin: TimePeriod) => {
  const fakeData = _.uniqBy(
    _.sortBy(
      _.range(100).map(() => ({
        count: faker.number.int({ min: 0, max: 1000 }),
        bin: truncateDate(
          faker.date.recent({
            days:
              bin === "day"
                ? 7
                : bin === "week"
                  ? 60
                  : bin === "month"
                    ? 365
                    : 2000,
          }),
          bin,
        ),
      })),
      (d) => d.bin,
    ),
    (d) => d.bin.getTime(),
  );
  return fakeData;
};

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
          // const start = getStartTime(past, from);
          // const end = to;
          // return await countSessionsOverTime(workspace.id, bin, start, end);
          return fakeTimeSeries(bin);
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
          return fakeTimeSeries(bin);
          // const start = getStartTime(past, from);
          // const end = to;
          // return await countUsersOverTime(workspace.id, bin, start, end);
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
