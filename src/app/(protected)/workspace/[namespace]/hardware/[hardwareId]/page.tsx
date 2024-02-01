import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { api } from "~/trpc/server";
import HardwareMeasurements from "./_components/hardware-measurements";

export default async function Hardware({
  params,
}: {
  params: { hardwareId: string; namespace: string };
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
        <PageHeaderHeading className="">{device.name}</PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on "{device.name}" are listed here.
        </PageHeaderDescription>
      </PageHeader>

      <HardwareMeasurements
        hardwareId={params.hardwareId}
        namespace={params.namespace}
        initialMeasurements={measurements}
      />
    </div>
  );
}
