import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import AllWorkspaces from "./_components/all-workspaces";
import { db } from "~/server/db";
import NewWorkspace from "./_components/new-workspace";

import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import NewProject from "./_components/new-project";

import { type SelectWorkspace } from "~/types/workspace";
export default async function Dashboard() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();
  if (!session) {
    return <div>BRUH</div>;
  }

  const workspaceIDs = (
    await db.query.workspace_user.findMany({
      where: (workspace_user, { eq }) =>
        eq(workspace_user.userID, session.user.userId),
      columns: {
        workspaceID: true,
      },
    })
  ).flatMap((workspace) => workspace.workspaceID);

  let workspaces = [] as SelectWorkspace[];

  if (workspaceIDs.length > 0) {
    workspaces = await db.query.workspace.findMany({
      where: (workspace, { inArray }) => inArray(workspace.id, workspaceIDs),
    });
  }

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
