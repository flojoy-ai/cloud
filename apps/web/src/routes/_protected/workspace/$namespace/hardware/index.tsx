import { createFileRoute } from "@tanstack/react-router";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import HardwareFamilies from "@/components/hardware/hardware-families";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/",
)({
  component: HardwareInventory,
  pendingComponent: () => <div></div>,
});

function HardwareInventory() {
  const { workspaceId } = Route.useRouteContext();
  const { namespace } = Route.useParams();

  const { data: families } = useSuspenseQuery({
    queryFn: async () => {
      const { data, error } = await client.family.index.get({
        query: { workspaceId },
      });
      if (error) throw error;
      return data;
    },
    queryKey: ["family"],
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

      <HardwareFamilies
        workspaceId={workspaceId}
        namespace={namespace}
        families={families}
      />

      <div className="py-4" />

      {/* <Separator /> */}
      {/**/}
      {/* <HardwareInstances */}
      {/*   hardware={hardware} */}
      {/*   models={models} */}
      {/*   workspaceId={workspaceId} */}
      {/*   namespace={params.namespace} */}
      {/* /> */}
      <div className="py-4" />
    </div>
  );
}
