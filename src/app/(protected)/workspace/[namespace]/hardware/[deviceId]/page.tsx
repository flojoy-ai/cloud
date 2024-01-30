import { MeasurementsDataTable } from "~/components/measurements-data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { Checkbox } from "~/components/ui/checkbox";

import { api } from "~/trpc/server";

export default async function Device({
  params,
}: {
  params: { deviceId: string; namespace: string };
}) {
  const device = await api.hardware.getHardwareById.query({
    hardwareId: params.deviceId,
  });
  const deviceMeasurements =
    await api.measurement.getAllMeasurementsByHardwareId.query({
      hardwareId: params.deviceId,
    });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{device.name}</PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on "{device.name}" are listed here.
        </PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>

      <MeasurementsDataTable
        measurements={deviceMeasurements}
        namespace={params.namespace}
      />
    </div>
  );
}
