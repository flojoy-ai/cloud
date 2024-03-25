import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type GetModelsParams = {
  context: {
    workspace: Workspace;
  };
};

export function getModelsOpts({ context }: GetModelsParams) {
  return queryOptions({
    queryFn: async () => {
      const modelsQuery = await client.model.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (modelsQuery.error) throw modelsQuery.error;
      return modelsQuery.data;
    },
    queryKey: ["models"],
  });
}

type GetModelParams = {
  modelId: string;
  context: {
    workspace: Workspace;
  };
};

export function getModelOpts({ context, modelId }: GetModelParams) {
  return queryOptions({
    queryFn: async () => {
      const modelsQuery = await client.model({ modelId }).index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (modelsQuery.error) throw modelsQuery.error;
      return modelsQuery.data;
    },
    queryKey: ["model", modelId],
  });
}

type GetFamilyModelsParams = {
  familyId: string;
  context: {
    workspace: Workspace;
  };
};

export function getFamilyModelsOpts({
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
    queryKey: ["models", familyId],
  });
}
