import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

export function getUserQueryKey() {
  return ["user"];
}

export function getUserQueryOpts() {
  return queryOptions({
    queryFn: async () => {
      const { data: user, error } = await client.user.index.get();
      if (error) throw error.value;
      return user;
    },
    queryKey: getUserQueryKey(),
    retry: false,
  });
}

type getWorkspaceUserProps = {
  context: {
    workspace: Workspace;
  };
};

export function getWorkspaceUserQueryKey(workspaceId: string) {
  return ["user", "workspace", workspaceId];
}

export function getWorkspaceUserQueryOpts({ context }: getWorkspaceUserProps) {
  return queryOptions({
    queryFn: async () => {
      const { data: user, error } = await client.user.workspace.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error.value;
      return user;
    },
    queryKey: getWorkspaceUserQueryKey(context.workspace.id),
  });
}
