import { api } from "~/trpc/server";
import WorkspaceProvider from "./workspace-provider";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { Button } from "@cloud/ui/components/ui/button";
import Link from "next/link";
import { WorkspaceNav } from "~/components/workspace-nav";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { namespace: string };
}) {
  const workspaces = await api.workspace.getWorkspaces();

  if (!workspaces.some((ws) => ws.namespace === params.namespace)) {
    return (
      <div className="container max-w-screen-2xl">
        <PageHeader>
          <PageHeaderHeading className="">
            Something went wrong!
          </PageHeaderHeading>
          <PageHeaderDescription className="">
            Oops, seems like you do not have access to this workspace.
          </PageHeaderDescription>
          <div className="py-1" />

          <div className="flex gap-2">
            <Button>
              {workspaces[0] && (
                <Link href={`/workspace/${workspaces[0].namespace}`}>
                  Go back
                </Link>
              )}
            </Button>
            <Button variant="secondary" asChild>
              <Link href={"/setup"}>Create a new workspace</Link>
            </Button>
          </div>
        </PageHeader>
      </div>
    );
  }

  return (
    <>
      <WorkspaceNav workspaces={workspaces} />
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </>
  );
}
