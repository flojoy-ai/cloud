import CodeBlock from "~/components/code-block";
import { columns } from "~/components/measurement/columns";
import { DataTable } from "~/components/measurement/data-table";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import { WorkspaceSecretReminder } from "~/components/workspace-secret-reminder";
import { api } from "~/trpc/server";

export default async function Test({
  params,
}: {
  params: { testId: string; workspaceId: string };
}) {
  const test = await api.test.getTestById.query({
    testId: params.testId,
  });

  const code = `from flojoy.cloud import FlojoyCloud

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

measurements = client.get_all_measurements_by_test_id("${params.testId}")
`;

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{test.name}</PageHeaderHeading>
        <PageHeaderDescription>
          All measurements for the "{test.name}" test are listed here.
        </PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>

      <DataTable columns={columns} data={test.measurements} />

      <div className="py-2" />
      <div>
        <h3 className="text-lg font-medium">Python Client</h3>
        <p className="text-sm text-muted-foreground">
          To do further analysis, download this data with Flojoy Cloud's Python
          client.
        </p>
      </div>
      <div>
        <CodeBlock code={code} />
        <WorkspaceSecretReminder workspaceId={params.workspaceId} />
      </div>
      <div className="py-8" />
    </div>
  );
}
