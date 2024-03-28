import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

type GetModelsParams = {
  context: {
    workspace: Workspace;
  };
};

export function getModelsQueryKey() {
  return ["models"];
}

export function getModelsQueryOpts({ context }: GetModelsParams) {
  return queryOptions({
    queryFn: async () => {
      const modelsQuery = await client.model.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (modelsQuery.error) throw modelsQuery.error;
      return modelsQuery.data;
    },
    queryKey: getModelsQueryKey(),
  });
}

type GetModelParams = {
  modelId: string;
  context: {
    workspace: Workspace;
  };
};

export function getModelQueryKey(modelId: string) {
  return ["model", modelId];
}

export function getModelQueryOpts({ context, modelId }: GetModelParams) {
  return queryOptions({
    queryFn: async () => {
      const modelsQuery = await client.model({ modelId }).index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (modelsQuery.error) throw modelsQuery.error;
      return modelsQuery.data;
    },
    queryKey: getModelQueryKey(modelId),
  });
}

type GetFamilyModelsParams = {
  familyId: string;
  context: {
    workspace: Workspace;
  };
};

export function getFamilyModelsQueryKey(familyId: string) {
  return ["models", familyId];
}

export function getFamilyModelsQueryOpts({
  familyId,
  context,
}: GetFamilyModelsParams) {
  return queryOptions({
    queryFn: async () => {
      const modelsQuery = await client.family({ familyId }).models.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (modelsQuery.error) throw modelsQuery.error;
      return modelsQuery.data;
    },
    queryKey: getFamilyModelsQueryKey(familyId),
  });
}
