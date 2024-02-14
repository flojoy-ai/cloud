import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";

import { api } from "~/trpc/server";
import HardwareMeasurements from "./_components/hardware-measurements";
import BackButton from "~/components/back-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { HardwareTreeVisualization } from "~/components/visualization/tree-visualization";
import SwapHardware from "~/components/hardware/swap-hardware";
import RevisionHistory from "~/components/hardware/revision-history";

export default async function Hardware({
  params,
  searchParams,
}: {
  params: { hardwareId: string; namespace: string };
  searchParams: { back?: string };
}) {
  const hardware = await api.hardware.getHardwareById.query({
    hardwareId: params.hardwareId,
  });
  const revisions = await api.hardware.getRevisions.query({
    hardwareId: params.hardwareId,
  });
  const measurements =
    await api.measurement.getAllMeasurementsByHardwareId.query({
      hardwareId: params.hardwareId,
      latest: true,
    });
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        {searchParams.back && <BackButton />}
        <PageHeaderHeading className="">
          <div className="flex items-center gap-x-2">
            <div>{hardware.name}</div>
            {hardware.components.length > 0 && (
              <>
                <SwapHardware hardware={hardware} workspaceId={workspaceId} />
                <RevisionHistory revisions={revisions} />
              </>
            )}
          </div>
        </PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on &quot;{hardware.name}&quot; are
          listed here.
        </PageHeaderDescription>
      </PageHeader>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:no-underline">
            Component Graph
          </AccordionTrigger>
          <AccordionContent>
            <div className="w-full p-1">
              <div className="h-96 rounded-md border border-muted">
                <HardwareTreeVisualization tree={hardware} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="py-4" />

      <HardwareMeasurements
        hardwareId={params.hardwareId}
        hardware={hardware}
        namespace={params.namespace}
        initialMeasurements={measurements}
      />
    </div>
  );
}
