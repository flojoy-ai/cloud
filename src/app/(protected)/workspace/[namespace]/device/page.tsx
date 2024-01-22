import { deviceColumns, modelColumns } from "~/components/device/columns";
import { DataTable } from "~/components/device/data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import CreateModel from "./_components/create-model";

export default async function DeviceInventory({
  params,
}: {
  params: { namespace: string };
}) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const hardware = await api.hardware.getAllHardware.query({
    workspaceId,
  });
  const deviceModels = await api.model.getAllDeviceModels.query({
    workspaceId,
  });
  const models = await api.model.getAllModels.query({
    workspaceId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading>Device Inventory</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all your registered devices in this workspace.
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />

      <h1 className="text-xl font-bold">Models</h1>
      <div className="py-1" />
      <CreateModel workspaceId={workspaceId} deviceModels={deviceModels} />
      <div className="py-2" />
      <DataTable columns={modelColumns} data={models} />
      <div className="py-4" />

      <h1 className="text-xl font-bold">Devices</h1>
      <div className="py-1" />
      <DataTable columns={deviceColumns} data={hardware} />
      <div className="py-4" />
    </div>
  );
}
