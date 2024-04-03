import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

export function getSecretQueryKey() {
  return ["secret"];
}

type GetSecretParams = {
  context: {
    workspace: Workspace;
  };
};

export function getSecretQueryOpts({ context }: GetSecretParams) {
  return queryOptions({
    queryFn: async () => {
      const { data: secret, error } = await client.secret.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) {
        return null;
      }

      return secret ?? null;
    },
    queryKey: getSecretQueryKey(),
  });
}
