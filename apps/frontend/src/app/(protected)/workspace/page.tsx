import { redirect } from "next/navigation";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import AllWorkspaces from "./_components/all-workspaces";
import { api } from "~/trpc/server";
import { Button } from "@cloud/ui/components/ui/button";
import Link from "next/link";

export default async function Dashboard() {
  const workspaces = await api.workspace.getWorkspaces.query();

  if (workspaces.length === 0) {
    redirect("/setup");
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
          <Link href="/setup">New Workspace</Link>
        </Button>
      </div>

      <div className="py-2"></div>

      <AllWorkspaces workspaces={workspaces} />

      <div className="py-4"></div>
    </div>
  );
}
