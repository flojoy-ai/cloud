import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type GetFamilyParams = {
  familyId: string;
  context: {
    workspace: Workspace;
  };
};

export function getFamilyOpts({ familyId, context }: GetFamilyParams) {
  return queryOptions({
    queryFn: async () => {
      const { data: family, error: familyError } = await client
        .family({ familyId })
        .get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });

      if (familyError) throw familyError;
      return family;
    },
    queryKey: ["family", familyId],
  });
}

type GetFamiliesParams = {
  context: {
    workspace: Workspace;
  };
};

export function getFamiliesOpts({ context }: GetFamiliesParams) {
  return queryOptions({
    queryFn: async () => {
      const { data: families, error: familyError } =
        await client.family.index.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });

      if (familyError) throw familyError;
      return families;
    },
    queryKey: ["family"],
  });
}
