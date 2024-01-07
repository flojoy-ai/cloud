import { type SelectProject } from "~/types/project";
import DeviceCard from "./device-card";
import { api } from "~/trpc/server";

type Props = {
  project: SelectProject;
  workspaceId: string;
};

const AllDevices = async ({ project, workspaceId }: Props) => {
  const devices = await api().device.getAllDevicesByProjectId.query({
    projectId: project.id,
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
          <DeviceCard
            device={device}
            key={device.id}
            workspaceId={workspaceId}
          />
        ))}
      </div>
    </div>
  );
};

export default AllDevices;
