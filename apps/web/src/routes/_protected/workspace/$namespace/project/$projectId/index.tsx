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
import { getProjectOpts } from "@/lib/queries/project";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/project/$projectId/",
)({
  beforeLoad: async ({ context, params: { projectId } }) => {
    const project = await context.queryClient.ensureQueryData(
      getProjectOpts({ projectId, context }),
    );
    return { project };
  },
  component: Page,
});

function Page() {
  const { workspace, project } = Route.useRouteContext();
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
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                to="/workspace/$namespace/project"
                params={{ namespace: workspace.namespace }}
              >
                Projects
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">{project.name}</PageHeaderHeading>
        <PageHeaderDescription></PageHeaderDescription>
      </PageHeader>

      <div className="py-4"></div>
    </div>
  );
}
