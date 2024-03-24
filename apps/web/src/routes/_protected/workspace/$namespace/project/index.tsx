// import { ProjectCard } from "@/components/project/project-card";
import NewProject from "@/components/project/new-project";
import { ProjectCard } from "@/components/project/project-card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { client } from "@/lib/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/",
)({
  beforeLoad: async ({ context }) => {
    console.log("context", context);
    const { data: projects, error } = await client.project.index.get({
      headers: { "flojoy-workspace-id": context.workspace.id },
    });
    if (error) {
      console.log(error.value);
      throw error;
    }
    return { projects };
  },
  component: Page,
});

function Page() {
  const { projects, workspace, models } = Route.useRouteContext();
  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading className="">Projects</PageHeaderHeading>
        <PageHeaderDescription>
          A project groups a set of test stations that run tests on a specific
          hardware model.
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
