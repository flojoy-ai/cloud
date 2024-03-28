import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

type getStationsProps = {
  projectId: string;
  context: {
    workspace: Workspace;
  };
};

export function getStationsQueryKey() {
  return ["stations"];
}

export function getStationsQueryOpts({ projectId, context }: getStationsProps) {
  return queryOptions({
    queryFn: async () => {
      const { data: stations, error } = await client.station.index.get({
        query: { projectId },
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) {
        throw error;
      }
      return stations;
    },
    queryKey: getStationsQueryKey(),
  });
}

type getStationProps = {
  stationId: string;
  context: {
    workspace: Workspace;
  };
};

export function getStationQueryKey(stationId: string) {
  return ["station", stationId];
}

export function getStationQueryOpts({ stationId, context }: getStationProps) {
  return queryOptions({
    queryFn: async () => {
      const { data: station, error } = await client.station({ stationId }).get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) {
        throw error;
      }
      return station;
    },
    queryKey: getStationQueryKey(stationId),
  });
}
