import { api } from "~/trpc/server";
import { Badge } from "~/components/ui/badge";
import CreateDevice from "./_components/create-device";
import AllDevices from "./_components/all-devices";
import { Separator } from "~/components/ui/separator";
// import CodeBlock from "~/components/code-block";
// import { WorkspaceSecretReminder } from "~/components/workspace-secret-reminder";
import CreateSystem from "./_components/create-system";
import { type SelectDeviceModel, type SelectSystemModel } from "~/types/model";
import { type SelectProject } from "~/types/project";

const isSystemProject = (
  project: SelectProject & { model: SelectSystemModel | SelectDeviceModel },
): project is SelectProject & { model: SelectSystemModel } => {
  return project.model.type === "system";
};

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

  //   const code = `from flojoy.cloud import FlojoyCloud
  //
  // # Create a device
  // device = client.create_device("DEVICE_NAME", "${workspaceId}")
  //
  // # Get an existing device
  // device = client.get_device_by_id("DEVICE_ID")
  //
  // # Get all devices from this workspace
  // devices = client.get_all_devices("${workspaceId}")
  //
  // # Get all devices from this project
  // devices = client.get_all_devices("${workspaceId}", "${params.projectId}")
  //
  // # Add device to this project
  // client.add_device_to_project("DEVICE_ID", "${params.projectId}")
  //
  // # Remove device from this project
  // client.remove_device_from_project("DEVICE_ID", "${params.projectId}")
  //
  // # Delete a device
  // client.delete_device_by_id("DEVICE_ID")
  // `;

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
      <div className="flex items-center gap-2">
        {isSystemProject(project) ? (
          <CreateSystem project={project} />
        ) : (
          <CreateDevice project={project} />
        )}
        <div>
          You can only register instances of <Badge>{project.model.name}</Badge>{" "}
          to this project.
        </div>
      </div>

      <div className="py-2"></div>
      <AllDevices
        project={project}
        workspaceId={workspaceId}
        namespace={params.namespace}
      />

      {/* <div className="py-8" /> */}
      {/* <div> */}
      {/*   <h3 className="text-lg font-medium">Python Client</h3> */}
      {/*   <p className="text-sm text-muted-foreground"> */}
      {/*     Create devices with Flojoy Cloud's Python client */}
      {/*   </p> */}
      {/* </div> */}
      {/* <div> */}
      {/*   <CodeBlock code={code} /> */}
      {/*   <WorkspaceSecretReminder namespace={params.namespace} /> */}
      {/* </div> */}
      <div className="py-8" />
    </div>
  );
};

export default DevicesView;
