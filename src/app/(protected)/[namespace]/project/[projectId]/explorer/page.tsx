import { api } from "~/trpc/server";
import ExplorerVisualization from "./_components/explorer-visualization";

const ExplorerView = async ({
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
  const tests = await api.test.getAllTestsByProjectId.query({
    projectId: project.id,
  });

  return (
    <div>
      <ExplorerVisualization
        tests={tests}
        workspaceId={workspaceId}
        namespace={params.namespace}
      />
    </div>
  );
};

export default ExplorerView;
