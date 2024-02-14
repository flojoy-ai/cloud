import CreateTest from "./_components/create-test";
import AllTests from "./_components/all-tests";
import { api } from "~/trpc/server";
import { Separator } from "~/components/ui/separator";

const TestsView = async ({
  params,
}: {
  params: { projectId: string; namespace: string };
}) => {
  const project = await api.project.getProject.query({
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
      <AllTests project={project} namespace={params.namespace} />

      <div className="py-8" />
    </div>
  );
};

export default TestsView;
