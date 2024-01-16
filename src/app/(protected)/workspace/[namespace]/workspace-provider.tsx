"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const WorkspaceContext = createContext<string>("");

const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [state, setState] = useState<string>(pathname.split("/")[1] ?? "");

  useEffect(() => {
    setState(pathname.split("/")[1] ?? "");
  }, [pathname]);

  return (
    <WorkspaceContext.Provider value={state}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error("Workspace not found");
  return workspace;
};

export default WorkspaceProvider;
