import {
  deviceColumns,
  deviceModelColumns,
  systemColumns,
  systemModelColumns,
} from "~/components/device/columns";
import { DataTable } from "~/components/device/data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import CreateModel from "./_components/create-model";

export default async function HardwareInventory({
  params,
}: {
  params: { namespace: string };
}) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const devices = await api.hardware.getAllDevices.query({
    workspaceId,
  });
  const systems = await api.hardware.getAllSystems.query({
    workspaceId,
  });

  const deviceModels = await api.model.getAllDeviceModels.query({
    workspaceId,
  });
  const systemModels = await api.model.getAllSystemModels.query({
    workspaceId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading>Hardware Inventory</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all your registered devices and systems in this
          workspace. <br />
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4" />

      <h1 className="text-2xl font-bold">Models</h1>
      <div className="py-1" />
      <CreateModel workspaceId={workspaceId} deviceModels={deviceModels} />
      <div className="py-4" />
      <h1 className="text-lg font-bold text-muted-foreground">Device Models</h1>
      <div className="py-2" />
      <DataTable columns={deviceModelColumns} data={deviceModels} />
      <div className="py-4" />
      <h1 className="text-lg font-bold text-muted-foreground">System Models</h1>
      <div className="py-2" />
      <DataTable columns={systemModelColumns} data={systemModels} />
      <div className="py-4" />

      <h1 className="text-2xl font-bold">Hardware Instances</h1>
      <div className="py-1" />
      <h1 className="text-lg font-bold text-muted-foreground">Devices</h1>
      <div className="py-2" />
      <DataTable columns={deviceColumns} data={devices} />
      <div className="py-4" />
      <h1 className="text-lg font-bold text-muted-foreground">Systems</h1>
      <div className="py-2" />
      <DataTable columns={systemColumns} data={systems} />
      <div className="py-4" />
    </div>
  );
}
