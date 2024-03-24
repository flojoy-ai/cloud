import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

export function getWorkspacesOpts() {
  return queryOptions({
    queryFn: async () => {
      const { data: workspaces, error } = await client.workspace.index.get();
      if (error) throw error;
      return workspaces;
    },
    queryKey: ["workspaces"],
  });
}

type getProjectProps = {
  namespace: string;
};

export function getWorkspaceOpts({ namespace }: getProjectProps) {
  return queryOptions({
    queryFn: async () => {
      const workspaceQuery = await client
        .workspace({
          namespace,
        })
        .get();
      if (workspaceQuery.error) throw workspaceQuery.error;

      return workspaceQuery.data;
    },
    queryKey: ["workspace", namespace],
  });
}
