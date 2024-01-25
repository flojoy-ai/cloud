import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import CreateModel from "./_components/create-model";
import HardwareInstances from "./_components/hardware-instances";
import HardwareModels from "./_components/hardware-models";

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

      <h1 className="text-2xl font-bold">Hardware Models</h1>
      <div className="py-1" />
      <CreateModel workspaceId={workspaceId} deviceModels={deviceModels} />
      <div className="py-4" />

      <HardwareModels
        deviceModels={deviceModels}
        systemModels={systemModels}
        workspaceId={workspaceId}
      />

      <HardwareInstances
        devices={devices}
        systems={systems}
        workspaceId={workspaceId}
      />
      <div className="py-4" />
    </div>
  );
}
