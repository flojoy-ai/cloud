import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { db } from "~/server/db";

export default async function Device({
  params,
}: {
  params: { deviceId: string };
}) {
  const device = await db.query.device.findFirst({
    where: (device, { eq }) => eq(device.id, params.deviceId),
  });

  if (!device) {
    return (
      <div className="container max-w-screen-2xl">
        <PageHeader>
          <PageHeaderHeading className="">Device not found</PageHeaderHeading>
          <PageHeaderDescription>
            We cannot find the device you are looking for. <br />
            Could you double check if the device exists and you have access to
            it?
          </PageHeaderDescription>
        </PageHeader>

        <div className="py-4"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{device.name}</PageHeaderHeading>
        <PageHeaderDescription>Your hardware device.</PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>
    </div>
  );
}
