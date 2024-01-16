import CreateTest from "./_components/create-test";
import AllTests from "./_components/all-tests";
import { api } from "~/trpc/server";
import { Separator } from "~/components/ui/separator";
import CodeBlock from "~/components/code-block";
import { WorkspaceSecretReminder } from "~/components/workspace-secret-reminder";

const TestsView = async ({
  params,
}: {
  params: { projectId: string; namespace: string };
}) => {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  const code = `from flojoy.cloud import FlojoyCloud

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

# Create a test
test = client.create_test("TEST_NAME", "${params.projectId}", measurement_type="boolean")

# Get an existing test, includes the measurements for that test
test = client.get_test_by_id("TEST_ID")

# Get all tests from this project
tests = client.get_all_tests_by_project_id("${params.projectId}")
`;

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
      <div>
        <h3 className="text-lg font-medium">Python Client</h3>
        <p className="text-sm text-muted-foreground">
          Create tests with Flojoy Cloud's Python client
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

export default TestsView;
