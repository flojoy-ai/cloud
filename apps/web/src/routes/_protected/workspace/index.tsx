import { Link, createFileRoute, redirect } from "@tanstack/react-router";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Button } from "@/components/ui/button";
import WorkspaceCard from "@/components/workspace/workspace-card";
import {
  getWorkspaceInvitesQueryOpts,
  getWorkspacesQueryOpts,
} from "@/lib/queries/workspace";
import { useSuspenseQuery } from "@tanstack/react-query";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import WorkspaceInvite from "@/components/workspace/workspace-invite";

export const Route = createFileRoute("/_protected/workspace/")({
  component: Workspaces,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getWorkspacesQueryOpts());
    context.queryClient.ensureQueryData(getWorkspaceInvitesQueryOpts());
  },
  pendingComponent: CenterLoadingSpinner,
});

function Workspaces() {
  const workspacesQuery = useSuspenseQuery(getWorkspacesQueryOpts());
  const { data: invites } = useSuspenseQuery(getWorkspaceInvitesQueryOpts());
  const { data: workspaces } = workspacesQuery;

  if (workspaces.length === 0) {
    redirect({ to: "/setup" });
  }

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Welcome</PageHeaderHeading>
        <PageHeaderDescription>
          Select a workspace to get started!
        </PageHeaderDescription>
      </PageHeader>

      <div className="py-2"></div>

      <div className="space-x-2">
        <Button size="sm" asChild>
          <Link to="/setup">New Workspace</Link>
        </Button>
      </div>

      <div className="py-2"></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {invites.map((invite) => {
          return <WorkspaceInvite key={invite.id} invite={invite} />;
        })}
        {workspaces
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((workspace) => {
            return <WorkspaceCard key={workspace.id} workspace={workspace} />;
          })}
      </div>

      <div className="py-4"></div>
    </div>
  );
}
