import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import {
  getWorkspaceQueryOpts,
  getWorkspacesQueryOpts,
} from "@/lib/queries/workspace";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { Button } from "@/components/ui/button";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { WorkspaceUserProvider } from "@/context/workspace-user";
import { getWorkspaceUserQueryOpts } from "@/lib/queries/user";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProtectedHeader } from "@/components/navbar/protected-header";

export const Route = createFileRoute("/_protected/workspace/$namespace")({
  component: Page,

  errorComponent: (error) => {
    console.error(error);
    return (
      <PageHeader>
        <PageHeaderHeading>Oops!</PageHeaderHeading>
        <PageHeaderDescription>
          You do not have access to this workspace :(
        </PageHeaderDescription>
        <div className="py-2"></div>
        <Button asChild>
          <Link to={"/workspace"}>Go Back</Link>
        </Button>
      </PageHeader>
    );
  },

  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context: { queryClient }, params: { namespace } }) => {
    const workspace = await queryClient.ensureQueryData(
      getWorkspaceQueryOpts({ namespace }),
    );
    return { workspace };
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getWorkspacesQueryOpts());

    context.queryClient.ensureQueryData(getWorkspaceUserQueryOpts({ context }));
  },
});

function Page() {
  const workspacesQuery = useSuspenseQuery(getWorkspacesQueryOpts());
  const { data: workspaces } = workspacesQuery;

  const context = Route.useRouteContext();
  const { data: workspaceUser } = useSuspenseQuery(
    getWorkspaceUserQueryOpts({ context }),
  );

  return (
    <WorkspaceUserProvider workspaceUser={workspaceUser}>
      <ProtectedHeader workspaces={workspaces} workspaceUser={workspaceUser} />
      <Outlet />
    </WorkspaceUserProvider>
  );
}
