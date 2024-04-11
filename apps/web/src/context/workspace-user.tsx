import { createContext } from "react";
import { WorkspaceUser } from "@cloud/shared";

export interface WorkspaceUserContext {
  workspaceUser: WorkspaceUser;
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
  return (
    <WorkspaceUserContext.Provider value={{ workspaceUser }}>
      {children}
    </WorkspaceUserContext.Provider>
  );
}
