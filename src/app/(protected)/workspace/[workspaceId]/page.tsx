import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import DeleteWorkspace from "./_components/delete-workspace";
import { api } from "~/trpc/server";

export default async function Workspace({
  params,
}: {
  params: { workspaceId: string };
}) {
  const workspace = await api.workspace.getWorkspaceById.query({
    workspaceId: params.workspaceId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{workspace.name}</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your workspace settings here.
        </PageHeaderDescription>
      </PageHeader>

      <DeleteWorkspace workspaceId={params.workspaceId} />

      <div className="py-4"></div>
    </div>
  );
}
