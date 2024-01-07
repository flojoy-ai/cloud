import { columns } from "~/components/measurement/columns";
import { DataTable } from "~/components/measurement/data-table";
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
  const device = await api().device.getDeviceById.query({
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

      <DataTable columns={columns} data={device.measurements} />
    </div>
  );
}
