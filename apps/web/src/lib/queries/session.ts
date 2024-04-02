import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

import { Workspace } from "@cloud/shared";

type GetSessionsParams = {
  unitId: string;
  context: {
    workspace: Workspace;
  };
};

export function getSessionsQueryOpts({
  unitId,
  context,
}: GetSessionsParams) {
  return queryOptions({
    queryFn: async () => {
      const unitQuery = await client.session.unit({ unitId }).get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (unitQuery.error) throw unitQuery.error;
      return unitQuery.data;
    },
    queryKey: ["session"],
  });
}

export const getSessionsQueryKey = () => ["session"];

type GetSessionParams = {
  sessionId: string;
  context: {
    workspace: Workspace;
  };
};

export function getSessionQueryOpts({ sessionId, context }: GetSessionParams) {
  return queryOptions({
    queryFn: async () => {
      const sessionQuery = await client.session({ sessionId }).get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (sessionQuery.error) throw sessionQuery.error;
      return sessionQuery.data;
    },
    queryKey: ["session", sessionId],
  });
}

export const getSessionQueryKey = (sessionId: string) => ["session", sessionId];
