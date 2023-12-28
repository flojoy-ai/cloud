import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";

import { auth } from "~/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";

import { db } from "~/server/db";

export default async function Device({
  params,
}: {
  params: { deviceId: string };
}) {
  // TODO: need to check if this user has access
  // to the workspace this project belongs to

  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (!session) {
    redirect("/login");
  }

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
      </div>
    );
  }

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{device.name}</PageHeaderHeading>
        <PageHeaderDescription>Your hardware device.</PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
