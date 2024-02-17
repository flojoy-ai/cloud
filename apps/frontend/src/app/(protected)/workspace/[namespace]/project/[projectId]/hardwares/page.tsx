import { api } from "~/trpc/server";
import AllHardwares from "./_components/all-hardwares";
import { Separator } from "@cloud/ui/components/ui/separator";

const DevicesView = async ({
  params,
}: {
  params: { projectId: string; namespace: string };
}) => {
  const [workspaceId, project] = await Promise.all([
    api.workspace.getWorkspaceIdByNamespace.query({
      namespace: params.namespace,
    }),
    api.project.getProject.query({
      projectId: params.projectId,
    }),
  ]);

  const [hardwares, modelHardware, models] = await Promise.all([
    api.hardware.getAllHardware.query({
      workspaceId,
      projectId: params.projectId,
    }),
    api.hardware.getAllHardware.query({
      workspaceId,
      modelId: project.modelId,
    }),
    api.model.getAllModels.query({
      workspaceId,
    }),
  ]);

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
