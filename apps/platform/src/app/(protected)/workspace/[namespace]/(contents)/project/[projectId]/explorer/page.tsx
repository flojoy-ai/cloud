import { api } from "~/trpc/server";
import ExplorerVisualization from "./_components/explorer-visualization";

const ExplorerView = async ({
  params,
}: {
  params: { projectId: string; namespace: string };
}) => {
  const [workspaceId, tests] = await Promise.all([
    api.workspace.getWorkspaceIdByNamespace({
      namespace: params.namespace,
    }),
    api.test.getAllTestsByProjectId({
      projectId: params.projectId,
    }),
  ]);
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
