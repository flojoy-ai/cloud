import { WorkspaceUserContext } from "@/context/workspace-user";
import { useContext } from "react";

export function useWorkspaceUser() {
  const context = useContext(WorkspaceUserContext);
  if (!context) {
    throw new Error(
      "useWorkspaceUser must be used within an WorkspaceUserProvider",
    );
  }
  return context;
}
