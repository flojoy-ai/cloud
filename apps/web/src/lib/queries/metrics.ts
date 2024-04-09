import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { TimeFilterQueryParams, TimePeriod, Workspace } from "@cloud/shared";
import { makeQueryParams } from "../utils";

type GetGlobalMetricsParams = {
  context: {
    workspace: Workspace;
  };
} & TimeFilterQueryParams;

export function getGlobalMetricsQueryKey() {
  return ["globalMetrics"];
}

export function getGlobalMetricsQueryOpts({
  past,
  from,
  to,
  context,
}: GetGlobalMetricsParams) {
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.metrics.workspace.get({
        query: makeQueryParams({ past, from, to }),
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error;
      return data;
    },
    queryKey: getGlobalMetricsQueryKey(),
  });
}

type GetGlobalMetricsSeriesParams = {
  bin: TimePeriod;
  context: {
    workspace: Workspace;
  };
} & TimeFilterQueryParams;

export function getGlobalMetricsSeriesQueryKey() {
  return ["globalMetricsSeries"];
}

export function getGlobalMetricsSeriesQueryOpts({
  past,
  bin,
  from,
  to,
  context,
}: GetGlobalMetricsSeriesParams) {
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.metrics.workspace.series.get({
        query: makeQueryParams({ bin, past, from, to }),
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error;
      return data;
    },
    queryKey: getGlobalMetricsSeriesQueryKey(),
  });
}

type GetProjectMetricsParams = {
  projectId: string;
  context: {
    workspace: Workspace;
  };
} & TimeFilterQueryParams;

export function getProjectMetricsQueryKey(projectId: string) {
  return ["projectMetrics", projectId];
}

export function getProjectMetricsQueryOpts({
  projectId,
  past,
  from,
  to,
  context,
}: GetProjectMetricsParams) {
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.metrics.project({ projectId }).get({
        query: makeQueryParams({ past, from, to }),
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error;
      return data;
    },
    queryKey: getProjectMetricsQueryKey(projectId),
  });
}
