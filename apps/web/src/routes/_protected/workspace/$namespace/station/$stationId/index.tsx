import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/small-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getProjectQueryOpts } from "@/lib/queries/project";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/station/$stationId/",
)({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      getProjectQueryOpts({ projectId: context.station.projectId, context }),
    );
  },
  component: Page,
});

function Page() {
  const context = Route.useRouteContext();
  const { workspace, station } = context;

  const { data: project } = useSuspenseQuery(
    getProjectQueryOpts({ projectId: station.projectId, context }),
  );

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={Route.fullPath}
                to="/workspace/$namespace/"
                params={{ namespace: workspace.namespace }}
              >
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../../..">
                Production Lines
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={Route.fullPath} to="../..">
                {project.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{station.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">{station.name}</PageHeaderHeading>
        <PageHeaderDescription></PageHeaderDescription>
      </PageHeader>
    </div>
  );
}

