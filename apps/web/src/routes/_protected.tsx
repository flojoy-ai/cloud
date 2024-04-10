import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { ProtectedHeader } from "@/components/navbar/protected-header";
import { getWorkspacesQueryOpts } from "@/lib/queries/workspace";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: Protected,
  beforeLoad({ context }) {
    if (!context.auth.isLoading && !context.auth.user) {
      throw redirect({ to: "/login" });
    }
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getWorkspacesQueryOpts());
  },
  pendingComponent: CenterLoadingSpinner,
});

function Protected() {
  const workspacesQuery = useSuspenseQuery(getWorkspacesQueryOpts());
  const { data: workspaces } = workspacesQuery;

  return (
    <div>
      <ProtectedHeader workspaces={workspaces} />
      <Outlet />
    </div>
  );
}
