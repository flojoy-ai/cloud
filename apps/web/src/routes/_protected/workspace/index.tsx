import {
  Link,
  createFileRoute,
  redirect,
  useLoaderData,
} from "@tanstack/react-router";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { Button } from "@/components/ui/button";
import WorkspaceCard from "@/components/workspace/workspace-card";
import { client } from "@/lib/client";

export const Route = createFileRoute("/_protected/workspace/")({
  component: Workspaces,
  loader: async () => {
    const { data, error } = await client.workspaces.index.get();
    if (error) {
      throw error;
    }
    return data;
  },
});

function Workspaces() {
  const workspaces = useLoaderData({ from: "/_protected/workspace/" });

  if (workspaces.length === 0) {
    redirect({ to: "/setup" });
  }

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">
          Welcome to Flojoy Cloud
        </PageHeaderHeading>
        <PageHeaderDescription>
          Select a workspace to get started!
        </PageHeaderDescription>
      </PageHeader>

      <div className="space-x-2">
        <Button size="sm" asChild>
          <Link to="/setup">New Workspace</Link>
        </Button>
      </div>

      <div className="py-2"></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {workspaces
          // TODO: Fix date deserialization with eden treaty
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((workspace) => {
            return <WorkspaceCard key={workspace.id} workspace={workspace} />;
          })}
      </div>

      <div className="py-4"></div>
    </div>
  );
}
