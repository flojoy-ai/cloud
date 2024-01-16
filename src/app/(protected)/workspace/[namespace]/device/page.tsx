import { columns } from "~/components/device/columns";
import { DataTable } from "~/components/device/data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { api } from "~/trpc/server";

export default async function DeviceInventory({
  params,
}: {
  params: { namespace: string };
}) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const devices = await api.device.getAllDevices.query({
    workspaceId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Device Inventory</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all your register devices in this workspace.
        </PageHeaderDescription>
      </PageHeader>

      <DataTable columns={columns} data={devices} />
      <div className="py-4"></div>
    </div>
  );
}
