import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { ProtectedHeader } from "@/components/navbar/protected-header";
import { getWorkspacesQueryOpts } from "@/lib/queries/workspace";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Navigate,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: Protected,
  loader: ({ context }) => {
    try {
      context.queryClient.ensureQueryData(getWorkspacesQueryOpts());
    } catch (error) {
      throw redirect({ to: "/login" });
    }
  },
  pendingComponent: CenterLoadingSpinner,
  errorComponent: () => <Navigate to="/login" />,
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
