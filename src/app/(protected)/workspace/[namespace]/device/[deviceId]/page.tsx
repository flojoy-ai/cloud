import { MeasurementsDataTable } from "~/components/measurements-data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { api } from "~/trpc/server";

export default async function Device({
  params,
}: {
  params: { deviceId: string; namespace: string };
}) {
  const device = await api.device.getDeviceById.query({
    deviceId: params.deviceId,
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
        measurements={device.measurements}
        namespace={params.namespace}
      />
    </div>
  );
}
