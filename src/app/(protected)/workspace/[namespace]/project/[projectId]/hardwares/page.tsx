import { api } from "~/trpc/server";
import AllHardwares from "./_components/all-hardwares";
import { Separator } from "~/components/ui/separator";
import CodeBlock from "~/components/code-block";
import { WorkspaceSecretReminder } from "~/components/workspace-secret-reminder";
import ImportHardware from "./_components/import-hardware";

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

  const code = `from flojoy.cloud import FlojoyCloud

# Create a device
device = client.create_device("${workspaceId}", "DEVICE_NAME", "MODEL_ID", "PROJECT_ID")

# Get an existing device
device = client.get_device_by_id("DEVICE_ID")

# Get all devices from this workspace
devices = client.get_all_devices("${workspaceId}")

# Get all devices from this project
devices = client.get_all_devices("${workspaceId}", "${params.projectId}")

# Add device to this project
client.add_device_to_project("DEVICE_ID", "${params.projectId}")

# Remove device from this project
client.remove_device_from_project("DEVICE_ID", "${params.projectId}")

# Delete a device
client.delete_device_by_id("DEVICE_ID")
  `;

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

      <div className="py-2"></div>

      <ImportHardware
        workspaceId={workspaceId}
        project={project}
        initialHardware={modelHardware}
        projectHardware={hardwares}
      />

      <div className="">
        <AllHardwares
          hardwares={hardwares}
          workspaceId={workspaceId}
          project={project}
          namespace={params.namespace}
        />
      </div>

      <div className="py-8" />
      <div>
        <h3 className="text-lg font-medium">Python Client</h3>
        <p className="text-sm text-muted-foreground">
          Create hardware instances with Flojoy Cloud's Python client
        </p>
      </div>
      <div>
        <CodeBlock code={code} />
        <WorkspaceSecretReminder namespace={params.namespace} />
      </div>
      <div className="py-8" />
    </div>
  );
};

export default DevicesView;
