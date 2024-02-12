import { api } from "~/trpc/server";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import NewProject from "./_components/new-project";
import ProjectCard from "./_components/project-card";

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
  const models = await api.model.getAllModels.query({
    workspaceId: workspace.id,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Projects</PageHeaderHeading>
        <PageHeaderDescription>
          A project is a collection of hardware instances that share the same
          hardware model and a common set of tests.
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-4"></div>

      <div className="space-x-2">
        <NewProject workspace={workspace} models={models} />
      </div>

      <div className="py-2"></div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {projects
          .sort(
            (a, b) =>
              (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0),
          )
          .map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              models={models}
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
    </div>
  );
}
