import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

import { Workspace } from "@cloud/shared";

type GetSessionsParams = {
  hardwareId: string;
  context: {
    workspace: Workspace;
  };
};

export function getSessionsQueryOpts({
  hardwareId,
  context,
}: GetSessionsParams) {
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
