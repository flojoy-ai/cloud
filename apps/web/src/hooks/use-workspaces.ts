import { WorkspacesContext } from "@/context/workspaces";
import { useContext } from "react";

export function useWorkspaces() {
  const context = useContext(WorkspacesContext);
  if (!context) {
    throw new Error("useWorkspaces must be used within an WorkspacesProvider");
  }
  return context;
}
