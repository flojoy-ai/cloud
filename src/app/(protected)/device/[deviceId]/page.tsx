import MeasurementTable from "~/components/measurement-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { api } from "~/trpc/server";

export default async function Device({
  params,
}: {
  params: { deviceId: string };
}) {
  const device = await api.device.getDeviceById.query({
    deviceId: params.deviceId,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{device.name}</PageHeaderHeading>
        <PageHeaderDescription>Your hardware device.</PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>

      <MeasurementTable measurements={device.measurements} />
    </div>
  );
}
