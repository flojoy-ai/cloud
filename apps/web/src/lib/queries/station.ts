import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type getStationsProps = {
  context: {
    workspace: Workspace;
  };
};

export function getStationsOpts({ context }: getStationsProps) {
  return queryOptions({
    queryFn: async () => {
      const { data: projects, error } = await client.project.index.get({
        headers: { "flojoy-workspace-id": context.workspace.id },
      });
      if (error) {
        throw error;
      }
      return projects;
    },
    queryKey: ["stations"],
  });
}

type getStationProps = {
  projectId: string;
  context: {
    workspace: Workspace;
  };
};

export function getStationOpts({ projectId, context }: getStationProps) {
  return queryOptions({
    queryFn: async () => {
      const { data: project, error } = await client
        .project({ projectId })
        .index.get({
          headers: { "flojoy-workspace-id": context.workspace.id },
        });
      if (error) {
        throw error;
      }
      return project;
    },
    queryKey: ["project", projectId],
  });
}
