"use client";
import { userColumns } from "../columns";
import { DataTable } from "~/components/ui/data-table";
import InviteUser from "./invite-user";
import { UserWithRole } from "~/types/user";
import { useMemo } from "react";
import { api } from "~/trpc/react";

type Props = {
  data: UserWithRole[];
  workspaceId: string;
  namespace: string;
};

const UserManagement = (props: Props) => {
  const { data: workspaceId } =
    api.workspace.getWorkspaceIdByNamespace.useQuery(
      {
        namespace: props.namespace,
      },
      { initialData: props.workspaceId },
    );

  const { data } = api.user.getUsersInWorkspace.useQuery(
    {
      workspaceId,
    },
    {
      initialData: props.data,
    },
  );

  const columns = useMemo(() => userColumns(workspaceId), [workspaceId]);

  return (
    <>
      <InviteUser workspaceId={workspaceId} />

      <DataTable columns={columns} data={data} />
    </>
  );
};

export default UserManagement;
