import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { Separator } from "~/components/ui/separator";

import { api } from "~/trpc/server";
import HardwareMeasurements from "./_components/hardware-measurements";
import BackButton from "~/components/back-button";

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

      <Separator className="my-6" />

      <HardwareMeasurements
        hardwareId={params.hardwareId}
        namespace={params.namespace}
        initialMeasurements={measurements}
      />
    </div>
  );
}
