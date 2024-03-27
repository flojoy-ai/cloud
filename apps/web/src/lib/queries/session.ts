import { Workspace } from "@cloud/server/src/schemas/public/Workspace";
import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

type GetAllHardwareParams = {
  hardwareId: string;
  context: {
    workspace: Workspace;
  };
};

export function getSessionsOpts({ hardwareId, context }: GetAllHardwareParams) {
  return queryOptions({
    queryFn: async () => {
      const hardwareQuery = await client.session.hardware({ hardwareId }).get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (hardwareQuery.error) throw hardwareQuery.error;
      return hardwareQuery.data;
    },
    queryKey: ["session"],
  });
}
