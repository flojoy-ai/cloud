import { api } from "~/trpc/server";
import CreateDevice from "./_components/create-device";
import AllDevices from "./_components/all-devices";
import { Separator } from "~/components/ui/separator";

const DevicesView = async ({ params }: { params: { projectId: string } }) => {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  return (
    <div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Hardware Devices</h2>
        <p className="text-muted-foreground">
          Here you can register each individual device you are testing in this
          project.
        </p>
      </div>
      <Separator className="my-6" />
      <CreateDevice project={project} />
      <div className="py-2"></div>
      <AllDevices project={project} />
    </div>
  );
};

export default DevicesView;
