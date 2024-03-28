import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

type getProjectsProps = {
  context: {
    workspace: Workspace;
  };
};

export function getProjectsQueryKey() {
  return ["projects"];
}

export function getProjectsQueryOpts({ context }: getProjectsProps) {
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
    queryKey: getProjectsQueryKey(),
  });
}

type getProjectProps = {
  projectId: string;
  context: {
    workspace: Workspace;
  };
};

export function getProjectQueryKey(projectId: string) {
  return ["project", projectId];
}

export function getProjectQueryOpts({ projectId, context }: getProjectProps) {
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
    queryKey: getProjectQueryKey(projectId),
  });
}
