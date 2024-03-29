import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import HardwareInstances from "./_components/hardware-instances";
import HardwareModels from "./_components/hardware-models";
import { Separator } from "@cloud/ui/components/ui/separator";
import { Button } from "@cloud/ui/components/ui/button";

export default async function HardwareInventory({
  params,
  searchParams,
}: {
  params: { namespace: string };
  searchParams: { back?: string };
}) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace({
    namespace: params.namespace,
  });

  const [models, hardware] = await Promise.all([
    api.model.getAllModels({
      workspaceId,
    }),
    api.hardware.getAllHardware({
      workspaceId,
    }),
  ]);

  return (
    <div className="container max-w-screen-2xl">
      {searchParams.back && <Button>Back</Button>}
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
        models={models}
        workspaceId={workspaceId}
        namespace={params.namespace}
      />

      <div className="py-4" />

      <Separator />

      <HardwareInstances
        hardware={hardware}
        models={models}
        workspaceId={workspaceId}
        namespace={params.namespace}
      />
      <div className="py-4" />
    </div>
  );
}
