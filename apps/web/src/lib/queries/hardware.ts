import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type GetHardwareParams = {
  hardwareId: string;
  context: {
    workspace: Workspace;
  };
};

export function getHardwareOpts({ hardwareId, context }: GetHardwareParams) {
  return queryOptions({
    queryFn: async () => {
      const hardwareQuery = await client.hardware({ hardwareId }).index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (hardwareQuery.error) throw hardwareQuery.error;
      return hardwareQuery.data;
    },
    queryKey: ["hardware", hardwareId],
  });
}

type GetHardwareRevisionsParams = {
  hardwareId: string;
  context: {
    workspace: Workspace;
  };
};

export function getHardwareRevisionsOpts({
  hardwareId,
  context,
}: GetHardwareRevisionsParams) {
  return queryOptions({
    queryFn: async () => {
      const hardwareQuery = await client
        .hardware({ hardwareId })
        .revisions.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });
      if (hardwareQuery.error) throw hardwareQuery.error;
      return hardwareQuery.data;
    },
    queryKey: ["hardware", "revisions", hardwareId],
  });
}

type GetAllHardwareParams = {
  onlyAvailable?: boolean;
  context: {
    workspace: Workspace;
  };
};

export function getAllHardwareOpts({
  onlyAvailable,
  context,
}: GetAllHardwareParams) {
  return queryOptions({
    queryFn: async () => {
      const hardwareQuery = await client.hardware.index.get({
        query: { onlyAvailable: String(onlyAvailable ?? false) },
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (hardwareQuery.error) throw hardwareQuery.error;
      return hardwareQuery.data;
    },
    queryKey: ["hardware"],
  });
}

type GetModelHardwareParams = {
  modelId: string;
  context: {
    workspace: Workspace;
  };
};

export function getModelHardwareOpts({
  modelId,
  context,
}: GetModelHardwareParams) {
  return queryOptions({
    queryFn: async () => {
      const hardwareQuery = await client.model({ modelId }).hardware.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (hardwareQuery.error) throw hardwareQuery.error;
      return hardwareQuery.data;
    },
    queryKey: ["hardware", modelId],
  });
}
