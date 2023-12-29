import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import DeleteWorkspace from "./_components/delete-workspace";

export default async function Workspace({
  params,
}: {
  params: { workspaceId: string };
}) {
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{params.workspaceId}</PageHeaderHeading>
        <PageHeaderDescription>
          Manage your workspace settings here.
        </PageHeaderDescription>
      </PageHeader>

      <DeleteWorkspace workspaceId={params.workspaceId} />

      <div className="py-4"></div>
    </div>
  );
}
