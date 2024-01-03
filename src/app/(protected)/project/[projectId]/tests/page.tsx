import CreateTest from "./_components/create-test";
import AllTests from "./_components/all-tests";
import { api } from "~/trpc/server";

const TestsView = async ({ params }: { params: { projectId: string } }) => {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });
  return (
    <div>
      <CreateTest project={project} />
      <div className="py-2"></div>
      <AllTests project={project} />
    </div>
  );
};

export default TestsView;
