import { queryOptions } from "@tanstack/react-query";
import { client } from "../client";
import { Workspace } from "@cloud/shared";

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
        throw error.value;
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
        throw error.value;
      }
      return project;
    },
    queryKey: getProjectQueryKey(projectId),
  });
}

type getProjectUsersProps = {
  context: {
    workspace: Workspace;
  };
  projectId: string;
};

export function getProjectUsersQueryKey(projectId: string) {
  return ["project", projectId, "users"];
}

export function getProjectUsersQueryOpts({
  context,
  projectId,
}: getProjectUsersProps) {
  return queryOptions({
    queryFn: async () => {
      const { data: projectUsers, error } = await client
        .project({ projectId })
        .user.index.get({
          headers: {
            "flojoy-workspace-id": context.workspace.id,
          },
        });
      if (error) throw error.value;
      return projectUsers;
    },
    queryKey: getProjectUsersQueryKey(context.workspace.id),
  });
}
