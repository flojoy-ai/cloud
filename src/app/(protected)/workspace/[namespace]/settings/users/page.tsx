import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/server";
import { userColumns } from "./columns";
import { DataTable } from "~/components/ui/data-table";

async function UserPage({ params }: { params: { namespace: string } }) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const data = await api.user.getUsersInWorkspace.query({ workspaceId });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Users</h3>
        <p className="text-sm text-muted-foreground">
          Manage users in the current workspace.
        </p>
      </div>
      <Separator />

      <DataTable columns={userColumns} data={data} />
    </div>
  );
}

export default UserPage;
