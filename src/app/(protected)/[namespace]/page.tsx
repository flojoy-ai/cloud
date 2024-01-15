import { api } from "~/trpc/server";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/page-header";
import NewProject from "./_components/new-project";
import ProjectCard from "./_components/project-card";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import CodeBlock from "~/components/code-block";
import { WorkspaceSecretReminder } from "~/components/workspace-secret-reminder";

export default async function Page({
  params,
}: {
  params: { namespace: string };
}) {
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  const workspace = await api.workspace.getWorkspaceById.query({ workspaceId });

  const projects = await api.project.getAllProjectsByWorkspaceId.query({
    workspaceId: workspace.id,
  });

  const code = `from flojoy.cloud import FlojoyCloud

client = FlojoyCloud(workspace_secret="YOUR_WORKSPACE_SECRET")

# Create a project
project = client.create_project("PROJECT_NAME", "${workspace.id}")

# Get an existing project
project = client.get_project_by_id("PROJECT_ID")

# Get every project in your workspace
project = client.get_all_projects_by_workspace_id("${workspace.id}")
`;

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">{workspace.name}</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find all the projects in this workspace. <br />
          Each project should host a single type of board with all its hardware
          instances.
        </PageHeaderDescription>
      </PageHeader>

      <div className="space-x-2">
        <NewProject workspace={workspace} />
        <Button asChild size="sm" variant="secondary">
          <Link href={`/${workspace.namespace}/settings/general`}>
            <div className="">Configure Workspace</div>
          </Link>
        </Button>
      </div>

      <div className="py-2"></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects
          .sort(
            (a, b) =>
              (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
          )
          .map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              workspace={workspace}
            />
          ))}
        {projects.length === 0 && (
          <div className="text-muted-foreground">
            No project found here, go create one!
          </div>
        )}
      </div>

      <div className="py-8" />
      <div>
        <h3 className="text-lg font-medium">Python Client</h3>
        <p className="text-sm text-muted-foreground">
          Create a project with Flojoy Cloud's Python client
        </p>
      </div>
      <div>
        <CodeBlock code={code} />
        <WorkspaceSecretReminder namespace={params.namespace} />
      </div>
      <div className="py-8" />
    </div>
  );
}
