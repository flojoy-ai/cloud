import { ProtectedHeader } from "@/components/protected-header";
import { WorkspacesProvider } from "@/context/workspaces";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: Protected,
});

function Protected() {
  return (
    <WorkspacesProvider>
      <ProtectedHeader />
      <Outlet />
    </WorkspacesProvider>
  );
}
