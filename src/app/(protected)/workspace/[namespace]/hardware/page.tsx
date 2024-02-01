import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import HardwareInstances from "./_components/hardware-instances";
import HardwareModels from "./_components/hardware-models";
import { Separator } from "~/components/ui/separator";

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

      <Separator />

      <HardwareModels
        deviceModels={deviceModels}
        systemModels={systemModels}
        workspaceId={workspaceId}
      />

      <Separator />

      <HardwareInstances
        devices={devices}
        systems={systems}
        deviceModels={deviceModels}
        systemModels={systemModels}
        workspaceId={workspaceId}
      />
      <div className="py-4" />
    </div>
  );
}
