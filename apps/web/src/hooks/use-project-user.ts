import { ProjectUserContext } from "@/context/project-user";
import { useContext } from "react";

export function useProjectUser() {
  const context = useContext(ProjectUserContext);
  if (!context) {
    throw new Error(
      "useProjectUser must be used within an ProjectUserProvider",
    );
  }
  return context;
}
