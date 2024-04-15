import { createContext } from "react";
import { Perm, ProjectUser, projectRoleToPerm } from "@cloud/shared";

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
  const projectUserPerm = new Perm(projectRoleToPerm(projectUser.role));
  return (
    <ProjectUserContext.Provider value={{ projectUser, projectUserPerm }}>
      {children}
    </ProjectUserContext.Provider>
  );
}
