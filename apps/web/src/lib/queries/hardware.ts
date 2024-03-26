import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type GetHardwareParams = {
  hardwareId: string;
  context: {
    workspace: Workspace;
  };
};

export function getHardwareQueryKey(hardwareId: string) {
  return ["hardware", hardwareId];
}

export function getHardwareQueryOpts({
  hardwareId,
  context,
}: GetHardwareParams) {
  return queryOptions({
    queryFn: async () => {
      const hardwareQuery = await client.hardware({ hardwareId }).index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (hardwareQuery.error) throw hardwareQuery.error;
      return hardwareQuery.data;
    },
    queryKey: getHardwareQueryKey(hardwareId),
  });
}

type GetHardwareRevisionsParams = {
  hardwareId: string;
  context: {
    workspace: Workspace;
  };
};

export function getHardwareRevisionsQueryKey(hardwareId: string) {
  return ["hardware", "revisions", hardwareId];
}

export function getHardwareRevisionsQueryOpts({
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
    queryKey: getHardwareRevisionsQueryKey(hardwareId),
  });
}

type GetAllHardwareParams = {
  onlyAvailable?: boolean;
  context: {
    workspace: Workspace;
  };
};

export function getHardwaresQueryKey() {
  return ["hardwares"];
}

export function getHardwaresQueryOpts({
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
    queryKey: getHardwaresQueryKey(),
  });
}

type GetModelHardwareParams = {
  modelId: string;
  context: {
    workspace: Workspace;
  };
};

export function getModelHardwareQueryKey(modelId: string) {
  return ["hardware", modelId];
}

export function getModelHardwareQueryOpts({
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
    queryKey: getModelHardwareQueryKey(modelId),
  });
}
