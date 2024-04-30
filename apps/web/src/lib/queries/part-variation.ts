import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

type GetPartVariationsParams = {
  context: {
    workspace: Workspace;
  };
};

export function getPartVariationsQueryKey() {
  return ["partVariations"];
}

export function getPartVariationsQueryOpts({
  context,
}: GetPartVariationsParams) {
  return queryOptions({
    queryFn: async () => {
      const partVariationsQuery = await client.partVariation.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (partVariationsQuery.error) throw partVariationsQuery.error;
      return partVariationsQuery.data;
    },
    queryKey: getPartVariationsQueryKey(),
  });
}

type GetPartVariationMarketsParams = {
  context: {
    workspace: Workspace;
  };
};

export function getPartVariationMarketsQueryKey() {
  return ["partVariationMarkets"];
}

export function getPartVariationMarketsQueryOpts({
  context,
}: GetPartVariationMarketsParams) {
  return queryOptions({
    queryFn: async () => {
      const result = await client.partVariation.market.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (result.error) throw result.error;
      return result.data;
    },
    queryKey: getPartVariationMarketsQueryKey(),
  });
}

type GetPartVariationTypesParams = {
  context: {
    workspace: Workspace;
  };
};

export function getPartVariationTypesQueryKey() {
  return ["partVariationTypes"];
}

export function getPartVariationTypesQueryOpts({
  context,
}: GetPartVariationTypesParams) {
  return queryOptions({
    queryFn: async () => {
      const result = await client.partVariation.type.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (result.error) throw result.error;
      return result.data;
    },
    queryKey: getPartVariationTypesQueryKey(),
  });
}

type GetPartVariationParams = {
  partVariationId: string;
  context: {
    workspace: Workspace;
  };
};

export function getPartVariationQueryKey(partVariationId: string) {
  return ["partVariation", partVariationId];
}

export function getPartVariationQueryOpts({
  context,
  partVariationId,
}: GetPartVariationParams) {
  return queryOptions({
    queryFn: async () => {
      const partVariationsQuery = await client
        .partVariation({ partVariationId })
        .index.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });
      if (partVariationsQuery.error) {
        throw partVariationsQuery.error;
      }
      return partVariationsQuery.data;
    },
    queryKey: getPartVariationQueryKey(partVariationId),
  });
}

type GetPartPartVariationsParams = {
  partId: string;
  context: {
    workspace: Workspace;
  };
};

export function getPartPartVariationsQueryKey(partId: string) {
  return ["part", "partVariations", partId];
}

export function getPartPartVariationsQueryOpts({
  partId,
  context,
}: GetPartPartVariationsParams) {
  return queryOptions({
    queryFn: async () => {
      const partVariationsQuery = await client
        .part({ partId })
        .partVariation.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });
      if (partVariationsQuery.error) throw partVariationsQuery.error;
      return partVariationsQuery.data;
    },
    queryKey: getPartPartVariationsQueryKey(partId),
  });
}
