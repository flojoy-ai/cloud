import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import AllWorkspaces from "./_components/all-workspaces";
import NewWorkspace from "./_components/new-workspace";

import NewProject from "./_components/new-project";
import { api } from "~/trpc/server";
import CreateSample from "./_components/create-sample";

export default async function Dashboard() {
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
          <CreateSample />
        </div>
      </div>

      <div className="py-2"></div>

      {workspaces.length === 0 && (
        <>
          <div className="py-2"></div>
          <div className="text-center">
            Welcome to Flojoy Cloud! <br />
            To get started, you need to create a workspace. <br />
            Don't know what to do yet? <br /> Press the 'Create a Sample
            Workspace + Project' button to populate your account with a demo.
          </div>
        </>
      )}
      <AllWorkspaces workspaces={workspaces} />

      <div className="py-4"></div>
    </div>
  );
}
