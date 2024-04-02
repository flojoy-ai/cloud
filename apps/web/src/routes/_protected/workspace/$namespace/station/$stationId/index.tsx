<<<<<<< HEAD
import CenterLoadingSpinner from "@/components/center-loading-spinner";
=======
import { columns } from "@/components/session/columns";
>>>>>>> 3587a306 (chore: station page & upload session (wip))
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
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { getProjectQueryOpts } from "@/lib/queries/project";
import { getSessionsByStationQueryOpts } from "@/lib/queries/session";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/station/$stationId/",
)({
  pendingComponent: CenterLoadingSpinner,
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

  const { data: sessions } = useSuspenseQuery(
    getSessionsByStationQueryOpts({ stationId: station.id, context }),
  );

  console.log(sessions);

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
              <Link
                from={Route.fullPath}
                to="/workspace/$namespace/project"
                params={{ namespace: workspace.namespace }}
              >
                Production Lines
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={Route.fullPath}
                to="/workspace/$namespace/project/$projectId"
                params={{
                  namespace: workspace.namespace,
                  projectId: project.id,
                }}
              >
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
        <PageHeaderDescription>Here you can consult all the session that have been executed at this station</PageHeaderDescription>
      </PageHeader>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <DataTable columns={columns} data={sessions} />
        </div>
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Pass</CardTitle>
              <CardDescription>
                Global Statistics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
