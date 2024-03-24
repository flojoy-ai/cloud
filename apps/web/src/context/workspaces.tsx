import { useQuery } from "@tanstack/react-query";
import { createContext } from "react";
import { client } from "@/lib/client";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";

export const WorkspacesContext = createContext<Workspace[] | null>(null);

export function WorkspacesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: workspaces } = useQuery({
    queryFn: async () => {
      const { data: workspaces, error } = await client.workspaces.index.get();
      if (error) {
        throw error;
      }
      return workspaces;
    },
    queryKey: ["workspaces"],
    retry: false,
  });

  return (
    <WorkspacesContext.Provider value={workspaces ?? []}>
      {children}
    </WorkspacesContext.Provider>
  );
}
