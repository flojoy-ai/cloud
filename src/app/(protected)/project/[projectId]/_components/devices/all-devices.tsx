import { db } from "~/server/db";
import { type SelectProject } from "~/types/project";
import DeviceCard from "./device-card";

type Props = {
  project: SelectProject;
};

const AllDevices = async ({ project }: Props) => {
  const devices = await db.query.device.findMany({
    where: (device, { eq }) => eq(device.projectId, project.id),
  });

  return (
    <div>
      {devices.length === 0 && (
        <div className="">
          No device found, get started by registering your hardware device.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {devices.map((device) => (
          <DeviceCard device={device} key={device.id} />
        ))}
      </div>
    </div>
  );
};

export default AllDevices;
