import { Icons } from "@/components/icons";
import { ProtectedHeader } from "@/components/navbar/protected-header";
import { getWorkspacesQueryOpts } from "@/lib/queries/workspace";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: Protected,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(getWorkspacesQueryOpts());
  },
  pendingComponent: () => (
    <div className="h-screen flex justify-center items-center">
      <Icons.spinner className="animate-spin" />
    </div>
  ),
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
