import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

type GetFamilyParams = {
  familyId: string;
  context: {
    workspace: Workspace;
  };
};

export function getFamilyQueryKey(familyId: string) {
  return ["family", familyId];
}

export function getFamilyQueryOpts({ familyId, context }: GetFamilyParams) {
  return queryOptions({
    queryFn: async () => {
      const { data: family, error: familyError } = await client
        .family({ familyId })
        .index.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });

      if (familyError) throw familyError;
      return family;
    },
    queryKey: getFamilyQueryKey(familyId),
  });
}

type GetFamiliesParams = {
  context: {
    workspace: Workspace;
  };
};

export function getFamiliesQueryKey() {
  return ["families"];
}

export function getFamiliesQueryOpts({ context }: GetFamiliesParams) {
  return queryOptions({
    queryFn: async () => {
      const { data: families, error: familyError } =
        await client.family.index.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });

      if (familyError) throw familyError;
      return families;
    },
    queryKey: getFamiliesQueryKey(),
  });
}
