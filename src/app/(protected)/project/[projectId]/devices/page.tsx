import { api } from "~/trpc/server";
import CreateDevice from "./_components/create-device";
import AllDevices from "./_components/all-devices";

const DevicesView = async ({ params }: { params: { projectId: string } }) => {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  return (
    <div>
      <CreateDevice project={project} />
      <div className="py-2"></div>
      <AllDevices project={project} />
    </div>
  );
};

export default DevicesView;
