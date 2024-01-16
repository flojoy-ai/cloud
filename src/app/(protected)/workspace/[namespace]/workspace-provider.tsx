"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const WorkspaceContext = createContext<string>("");

const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [state, setState] = useState<string>(getScope(pathname));

  useEffect(() => {
    setState(getScope(pathname));
  }, [pathname]);

  return (
    <WorkspaceContext.Provider value={state}>
      {children}
    </WorkspaceContext.Provider>
  );
};

const getScope = (pathname: string): string => {
  const segments = pathname.split("/");
  const scope = segments[1] === "workspace" ? segments[2] ?? "" : "";
  return scope;
};

export const useWorkspace = () => {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error("Workspace not found");
  return workspace;
};

export default WorkspaceProvider;
