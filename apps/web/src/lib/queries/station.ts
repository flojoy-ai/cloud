import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type getStationsProps = {
  projectId: string;
  context: {
    workspace: Workspace;
  };
};

export function getStationsOpts({ projectId, context }: getStationsProps) {
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
    queryKey: ["stations"],
  });
}

// type getStationProps = {
//   stationId: string;
//   context: {
//     workspace: Workspace;
//   };
// };
//
// export function getStationOpts({ stationId, context }: getStationProps) {
//   return queryOptions({
//     queryFn: async () => {
//       const { data: station, error } = await client
//         .station({ stationId })
//         .index.get({
//           headers: { "flojoy-workspace-id": context.workspace.id },
//         });
//       if (error) {
//         throw error;
//       }
//       return station;
//     },
//     queryKey: ["project", projectId],
//   });
// }
