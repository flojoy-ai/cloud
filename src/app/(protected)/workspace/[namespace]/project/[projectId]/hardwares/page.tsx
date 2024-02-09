import { api } from "~/trpc/server";
import AllHardwares from "./_components/all-hardwares";
import { Separator } from "~/components/ui/separator";

const DevicesView = async ({
  params,
}: {
  params: { projectId: string; namespace: string };
}) => {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  const hardwares = await api.hardware.getAllHardware.query({
    workspaceId,
    projectId: project.id,
  });

  const modelHardware = await api.hardware.getAllHardware.query({
    workspaceId,
    modelId: project.modelId,
  });
  const models = await api.model.getAllModels.query({
    workspaceId,
  });

  return (
    <div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          Hardware Instances
        </h2>
        <p className="text-muted-foreground">
          Here you can register each individual hardware instance that you are
          testing in this project.
        </p>
      </div>

      <Separator className="my-6" />

      <AllHardwares
        hardwares={hardwares}
        models={models}
        modelHardware={modelHardware}
        workspaceId={workspaceId}
        project={project}
        namespace={params.namespace}
      />

      <div className="py-8" />
    </div>
  );
};

export default DevicesView;
