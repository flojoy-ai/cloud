import { Workspace } from "@cloud/shared";
import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";

type GetProductsParams = {
  context: {
    workspace: Workspace;
  };
};

export function getProductsQueryKey() {
  return ["products"];
}

export function getProductsQueryOpts({ context }: GetProductsParams) {
  return queryOptions({
    queryFn: async () => {
      const { data, error } = await client.product.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) throw error.value;
      return data;
    },
    queryKey: getProductsQueryKey(),
  });
}
