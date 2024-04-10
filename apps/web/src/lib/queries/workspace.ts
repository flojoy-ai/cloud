import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

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

type getWorkspaceUsersProps = {
  context: {
    workspace: Workspace;
  };
};

export function getWorkspaceUsersQueryKey(namespace: string) {
  return ["workspace", namespace, "users"];
}

export function getWorkspaceUsersQueryOpts({
  context,
}: getWorkspaceUsersProps) {
  return queryOptions({
    queryFn: async () => {
      const { data: workspaces, error } = await client.workspace.users.get({
        headers: {
          "flojoy-workspace-id": context.workspace.id,
        },
      });
      if (error) throw error.value;
      return workspaces;
    },
    queryKey: getWorkspaceUsersQueryKey(context.workspace.namespace),
  });
}
