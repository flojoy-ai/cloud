import { keepPreviousData, queryOptions } from "@tanstack/react-query";
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
      const { data, error } = await client.metrics.workspace.index.get({
        query: makeQueryParams({ past, from, to }),
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error;
      return data;
    },
    queryKey: getGlobalMetricsQueryKey(),
    placeholderData: keepPreviousData,
  });
}

type GetGlobalMetricsTimeSeriesParams = {
  bin: TimePeriod;
  context: {
    workspace: Workspace;
  };
} & TimeFilterQueryParams;

export function getGlobalMetricsSessionTimeSeriesQueryKey(
  query: Omit<GetGlobalMetricsTimeSeriesParams, "context">,
) {
  return ["globalMetricsSessionTimeSeries", query];
}

export function getGlobalMetricsSessionTimeSeriesQueryOpts(
  params: GetGlobalMetricsTimeSeriesParams,
) {
  const { context, ...query } = params;
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.metrics.workspace.series.session.get(
        {
          query: makeQueryParams(query),
          headers: { "flojoy-workspace-id": context.workspace.id },
        },
      );
      if (error) throw error;
      return data;
    },
    queryKey: getGlobalMetricsSessionTimeSeriesQueryKey(query),
    placeholderData: keepPreviousData,
  });
}

export function getGlobalMetricsUserTimeSeriesQueryKey(
  query: Omit<GetGlobalMetricsTimeSeriesParams, "context">,
) {
  return ["globalMetricsUserTimeSeries", query];
}

export function getGlobalMetricsUserTimeSeriesQueryOpts(
  params: GetGlobalMetricsTimeSeriesParams,
) {
  const { context, ...query } = params;
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.metrics.workspace.series.user.get({
        query: makeQueryParams(query),
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error;
      return data;
    },
    queryKey: getGlobalMetricsUserTimeSeriesQueryKey(query),
    placeholderData: keepPreviousData,
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
      const { data, error } = await client.metrics
        .project({ projectId })
        .index.get({
          query: makeQueryParams({ past, from, to }),
          headers: { "flojoy-workspace-id": context.workspace.id },
        });
      if (error) throw error;
      return data;
    },
    queryKey: getProjectMetricsQueryKey(projectId),
  });
}

type GetProjectMetricsSeriesParams = {
  projectId: string;
  bin: TimePeriod;
  past: TimePeriod | undefined;
  context: {
    workspace: Workspace;
  };
};

export function getProjectMetricsSeriesQueryKey(
  projectId: string,
  bin: TimePeriod,
  past: TimePeriod | undefined,
) {
  return ["projectMetricsSeries", projectId, bin, past];
}

export function getProjectMetricsSeriesQueryOpts({
  projectId,
  bin,
  past,
  context,
}: GetProjectMetricsSeriesParams) {
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.metrics
        .project({ projectId })
        .series.get({
          query: makeQueryParams({ bin, past }),
          headers: { "flojoy-workspace-id": context.workspace.id },
        });
      if (error) throw error;
      return data;
    },
    queryKey: getProjectMetricsSeriesQueryKey(projectId, bin, past),
    placeholderData: keepPreviousData,
  });
}
