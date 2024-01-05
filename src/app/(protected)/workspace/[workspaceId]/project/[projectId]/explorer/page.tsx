import { api } from "~/trpc/server";
import ExplorerVisualization from "./_components/explorer-visualization";

const ExplorerView = async ({ params }: { params: { projectId: string } }) => {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });
  const tests = await api.test.getAllTestsByProjectId.query({
    projectId: project.id,
  });

  return (
    <div>
      <ExplorerVisualization tests={tests} />
    </div>
  );
};

export default ExplorerView;
