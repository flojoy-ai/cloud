import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

type GetPartParams = {
  partId: string;
  context: {
    workspace: Workspace;
  };
};

export function getPartQueryKey(partId: string) {
  return ["part", partId];
}

export function getPartQueryOpts({ partId, context }: GetPartParams) {
  return queryOptions({
    queryFn: async () => {
      const { data: part, error: partError } = await client
        .part({ partId })
        .index.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });

      if (partError) throw partError;
      return part;
    },
    queryKey: getPartQueryKey(partId),
  });
}

type GetPartsParams = {
  context: {
    workspace: Workspace;
  };
};

export function getPartsQueryKey() {
  return ["parts"];
}

export function getPartsQueryOpts({ context }: GetPartsParams) {
  return queryOptions({
    queryFn: async () => {
      const { data: families, error: partError } = await client.part.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });

      if (partError) throw partError;
      return families;
    },
    queryKey: getPartsQueryKey(),
  });
}
