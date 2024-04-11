import { createContext } from "react";
import { Perm, WorkspaceUser, workspaceRoleToPerm } from "@cloud/shared";

export interface WorkspaceUserContext {
  workspaceUser: WorkspaceUser;
  workspaceUserPerm: Perm;
}

export const WorkspaceUserContext = createContext<WorkspaceUserContext | null>(
  null,
);

export function WorkspaceUserProvider({
  children,
  workspaceUser,
}: {
  children: React.ReactNode;
  workspaceUser: WorkspaceUser;
}) {
  const workspaceUserPerm = new Perm(workspaceRoleToPerm(workspaceUser.role));
  return (
    <WorkspaceUserContext.Provider value={{ workspaceUser, workspaceUserPerm }}>
      {children}
    </WorkspaceUserContext.Provider>
  );
}
