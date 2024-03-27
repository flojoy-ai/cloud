import { getSessionQueryOpts } from "@/lib/queries/session";

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
import { getStationQueryOpts } from "@/lib/queries/station";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace/index";
import { getHardwareQueryOpts } from "@/lib/queries/hardware";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/session/$sessionId/",
)({
  component: Page,
  beforeLoad: async ({ context, params: { sessionId } }) => {
    const session = await context.queryClient.ensureQueryData(
      getSessionQueryOpts({ sessionId, context }),
    );
    const station = await context.queryClient.ensureQueryData(
      getStationQueryOpts({ stationId: session.stationId, context }),
    );
    const hardware = await context.queryClient.ensureQueryData(
      getHardwareQueryOpts({ hardwareId: session.hardwareId, context }),
    );
    return { session, station, hardware };
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      getProjectQueryOpts({ projectId: context.station.projectId, context }),
    );
  },
});

function Page() {
  const context = Route.useRouteContext();
  const { workspace, station, hardware, session } = context;

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
              <Link from={WorkspaceIndexRoute.fullPath} to=".">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.fullPath} to="project">
                Production Lines
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="project/$projectId"
                params={{ projectId: project.id }}
              >
                {project.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="station/$stationId"
                params={{
                  stationId: station.id,
                }}
              >
                {station.name}
              </Link>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Test Session</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">
          Test Session for {hardware.name}
        </PageHeaderHeading>
        <PageHeaderDescription>
          {session.createdAt.toISOString()}
        </PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
