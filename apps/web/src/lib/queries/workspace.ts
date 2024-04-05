import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

export function getWorkspacesQueryKey() {
  return ["workspaces"];
}

export function getWorkspacesQueryOpts() {
  return queryOptions({
    queryFn: async () => {
      const { data: workspaces, error } = await client.workspace.index.get();
      if (error) throw error.value;
      return workspaces;
    },
    queryKey: getWorkspacesQueryKey(),
  });
}

type getProjectProps = {
  namespace: string;
};

export function getWorkspaceQueryKey(namespace: string) {
  return ["workspace", namespace];
}

export function getWorkspaceQueryOpts({ namespace }: getProjectProps) {
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
    queryKey: getWorkspaceQueryKey(namespace),
  });
}
