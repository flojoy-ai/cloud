import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { Separator } from "~/components/ui/separator";

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

export default async function Hardware({
  params,
  searchParams,
}: {
  params: { hardwareId: string; namespace: string };
  searchParams: { back?: string };
}) {
  const device = await api.hardware.getHardwareById.query({
    hardwareId: params.hardwareId,
  });
  const measurements =
    await api.measurement.getAllMeasurementsByHardwareId.query({
      hardwareId: params.hardwareId,
      latest: true,
    });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        {searchParams.back && <BackButton />}
        <PageHeaderHeading className="">{device.name}</PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on &quot;{device.name}&quot; are
          listed here.
        </PageHeaderDescription>
      </PageHeader>

      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="hover:no-underline">
            Component graph
          </AccordionTrigger>
          <AccordionContent>
            <div className="h-96 w-screen">
              <HardwareTreeVisualization tree={device} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="py-4" />

      <HardwareMeasurements
        hardwareId={params.hardwareId}
        hardware={device}
        namespace={params.namespace}
        initialMeasurements={measurements}
      />
    </div>
  );
}
