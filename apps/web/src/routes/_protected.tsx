import { ProtectedHeader } from "@/components/protected-header";
import { client } from "@/lib/client";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: Protected,
  beforeLoad: async () => {
    const { data: workspaces, error } = await client.workspace.index.get();
    if (error) throw error;
    return { workspaces };
  },
});

function Protected() {
  const { workspaces } = Route.useRouteContext();
  return (
    <div>
      <ProtectedHeader workspaces={workspaces} />
      <Outlet />
    </div>
  );
}
