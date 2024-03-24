import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type getModelsProps = {
  context: {
    workspace: Workspace;
  };
};

export function getModelsOpts({ context }: getModelsProps) {
  return queryOptions({
    queryFn: async () => {
      const modelsQuery = await client.model.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (modelsQuery.error) throw modelsQuery.error;
      return modelsQuery.data;
    },
    queryKey: ["models"],
  });
}
