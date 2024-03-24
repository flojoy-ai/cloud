import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

// type getProjectsProps = {
//   context: {
//     workspace: Workspace;
//   };
// };
//
// export function getProjectsOpts({ context }: getProjectsProps) {
//   return queryOptions({
//     queryFn: async () => {
//       const { data: projects, error } = await client.project.index.get({
//         headers: { "flojoy-workspace-id": context.workspace.id },
//       });
//       if (error) {
//         throw error;
//       }
//       return projects;
//     },
//     queryKey: ["projects"],
//   });
// }

type getFamilyProps = {
  familyId: string;
  context: {
    workspace: Workspace;
  };
};

export function getFamilyOpts({ familyId, context }: getFamilyProps) {
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
