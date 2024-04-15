import { createContext } from "react";
import { Perm, ProjectUser, projectRoleToPerm } from "@cloud/shared";
import { useWorkspaceUser } from "@/hooks/use-workspace-user";

export interface ProjectUserContext {
  projectUser: ProjectUser;
  projectUserPerm: Perm;
}

export const ProjectUserContext = createContext<ProjectUserContext | null>(
  null,
);

export function ProjectUserProvider({
  children,
  projectUser,
}: {
  children: React.ReactNode;
  projectUser: ProjectUser;
}) {
  const { workspaceUserPerm } = useWorkspaceUser();

  // NOTE: a workspace admin should by default has all perm for projects as well
  const projectUserPerm = workspaceUserPerm.canAdmin()
    ? workspaceUserPerm
    : new Perm(projectRoleToPerm(projectUser.role));

  return (
    <ProjectUserContext.Provider value={{ projectUser, projectUserPerm }}>
      {children}
    </ProjectUserContext.Provider>
  );
}
