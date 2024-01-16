import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import AllWorkspaces from "./_components/all-workspaces";
import { api } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function Dashboard() {
  const workspaces = await api.workspace.getWorkspaces.query();

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">
          Welcome to Flojoy Cloud
        </PageHeaderHeading>
        <PageHeaderDescription>
          Select a workspace to get started! <br />
          Don't have one yet? You can create a new workspace here.
        </PageHeaderDescription>
      </PageHeader>

      <div className="space-x-2">
        <Button size="sm" asChild>
          <Link href="/setup">New Workspace</Link>
        </Button>
      </div>

      <div className="py-2"></div>

      {workspaces.length === 0 && (
        <>
          <div className="py-2"></div>
          <div className="text-center">
            Welcome to Flojoy Cloud! <br />
            To get started, you need to create a workspace. <br />
            Don't know what to do yet? <br /> Press the 'Create a Sample
            Workspace' button to populate your account with a demo.
          </div>
        </>
      )}
      <AllWorkspaces workspaces={workspaces.map((r) => r.workspace)} />

      <div className="py-4"></div>
    </div>
  );
}
