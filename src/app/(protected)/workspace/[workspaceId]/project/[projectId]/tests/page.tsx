import CreateTest from "./_components/create-test";
import AllTests from "./_components/all-tests";
import { api } from "~/trpc/server";
import { Separator } from "~/components/ui/separator";

const TestsView = async ({
  params,
}: {
  params: { projectId: string; workspaceId: string };
}) => {
  const project = await api().project.getProjectById.query({
    projectId: params.projectId,
  });
  return (
    <div>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Test Suite</h2>
        <p className="text-muted-foreground">
          Here you can register individual tests into this test suite.
        </p>
      </div>
      <Separator className="my-6" />
      <CreateTest project={project} />
      <div className="py-2"></div>
      <AllTests project={project} workspaceId={params.workspaceId} />
    </div>
  );
};

export default TestsView;
