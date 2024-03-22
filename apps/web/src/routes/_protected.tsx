import { ProtectedHeader } from "@/components/protected-header";
import { client } from "@/lib/client";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: Protected,
  loader: async () => {
    const { data: workspaces, error } = await client.workspaces.index.get();
    if (error) {
      throw error;
    }
    return {
      workspaces,
    };
  },
});

function Protected() {
  return (
    <div>
      <ProtectedHeader />
      <Outlet />
    </div>
  );
}
