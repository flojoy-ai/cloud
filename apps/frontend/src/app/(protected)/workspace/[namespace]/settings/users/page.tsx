import { Separator } from "@cloud/ui/components/ui/separator";
import { api } from "~/trpc/server";
import UserManagement from "./_components/user-management";
import { UserWithRole } from "~/types/user";

async function UserPage({ params }: { params: { namespace: string } }) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const data: UserWithRole[] = await api.user.getUsersInWorkspace.query({
    workspaceId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Users</h3>
        <p className="text-sm text-muted-foreground">
          Manage users in the current workspace.
        </p>
      </div>
      <Separator />

      <UserManagement
        data={data}
        workspaceId={workspaceId}
        namespace={params.namespace}
      />
    </div>
  );
}

export default UserPage;
