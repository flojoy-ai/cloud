import NewProject from "@/components/project/new-project";
import { ProjectCard } from "@/components/project/project-card";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProjectsOpts } from "@/lib/queries/project";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getModelsOpts } from "@/lib/queries/model";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/",
)({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getProjectsOpts({ context }));
    context.queryClient.ensureQueryData(getModelsOpts({ context }));
  },
  component: Page,
});

function Page() {
  const { workspace } = Route.useRouteContext();

  const { data: projects } = useSuspenseQuery(
    getProjectsOpts({ context: { workspace } }),
  );

  const { data: models } = useSuspenseQuery(
    getModelsOpts({ context: { workspace } }),
  );

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/workspace/$namespace"
                params={{ namespace: workspace.namespace }}
              >
                Home
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Projects</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
