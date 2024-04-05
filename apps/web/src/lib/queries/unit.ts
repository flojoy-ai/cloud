import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

type GetUnitParams = {
  unitId: string;
  context: {
    workspace: Workspace;
  };
};

export function getUnitQueryKey(unitId: string) {
  return ["unit", unitId];
}

export function getUnitQueryOpts({ unitId, context }: GetUnitParams) {
  return queryOptions({
    queryFn: async () => {
      const unitQuery = await client.unit({ unitId }).index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (unitQuery.error) {
        console.log(unitQuery.error);
        throw unitQuery.error;
      }
      return unitQuery.data;
    },
    queryKey: getUnitQueryKey(unitId),
  });
}

type GetUnitRevisionsParams = {
  unitId: string;
  context: {
    workspace: Workspace;
  };
};

export function getUnitRevisionsQueryKey(unitId: string) {
  return ["unit", "revisions", unitId];
}

export function getUnitRevisionsQueryOpts({
  unitId,
  context,
}: GetUnitRevisionsParams) {
  return queryOptions({
    queryFn: async () => {
      const unitQuery = await client.unit({ unitId }).revisions.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (unitQuery.error) throw unitQuery.error;
      return unitQuery.data;
    },
    queryKey: getUnitRevisionsQueryKey(unitId),
  });
}

type GetAllUnitParams = {
  onlyAvailable?: boolean;
  context: {
    workspace: Workspace;
  };
};

export function getUnitsQueryKey() {
  return ["units"];
}

export function getUnitsQueryOpts({
  onlyAvailable,
  context,
}: GetAllUnitParams) {
  return queryOptions({
    queryFn: async () => {
      const unitQuery = await client.unit.index.get({
        query: { onlyAvailable: String(onlyAvailable ?? false) },
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (unitQuery.error) throw unitQuery.error;
      return unitQuery.data;
    },
    queryKey: getUnitsQueryKey(),
  });
}

type GetPartVariationUnitParams = {
  partVariationId: string;
  context: {
    workspace: Workspace;
  };
};

export function getPartVariationUnitQueryKey(partVariationId: string) {
  return ["unit", partVariationId];
}

export function getPartVariationUnitQueryOpts({
  partVariationId,
  context,
}: GetPartVariationUnitParams) {
  return queryOptions({
    queryFn: async () => {
      const unitQuery = await client
        .partVariation({ partVariationId })
        .unit.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });
      if (unitQuery.error) throw unitQuery.error;
      return unitQuery.data;
    },
    queryKey: getPartVariationUnitQueryKey(partVariationId),
  });
}
