import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import AllWorkspaces from "./_components/all-workspaces";
import NewWorkspace from "./_components/new-workspace";

import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import NewProject from "./_components/new-project";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

export default async function Dashboard() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (!session) {
    redirect("/login");
  }

  const workspaces = await api.workspace.getAllWorkspaces.query();

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Dashboard</PageHeaderHeading>
        <PageHeaderDescription>
          Select a project in your workspaces to get started! <br />
          You can also create a new workspace or a new project here.
        </PageHeaderDescription>
      </PageHeader>

      <div className="flex flex-col items-center">
        <div className="flex gap-2">
          <NewProject workspaces={workspaces} />
          <NewWorkspace />
        </div>
      </div>

      <div className="py-2"></div>

      <AllWorkspaces workspaces={workspaces} />

      <div className="py-4"></div>
    </div>
  );
}
