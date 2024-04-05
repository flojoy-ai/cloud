import { getSessionQueryOpts } from "@/lib/queries/session";

import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { SessionTable } from "@/components/session/session-table";
import { PageHeader, PageHeaderHeading } from "@/components/small-header";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card } from "@/components/ui/card";
import { getProjectQueryOpts } from "@/lib/queries/project";
import { getStationQueryOpts } from "@/lib/queries/station";
import { getUnitQueryOpts } from "@/lib/queries/unit";
import { computePassingStatus } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace/index";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, CpuIcon, X } from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/session/$sessionId/",
)({
  component: Page,

  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context, params: { sessionId } }) => {
    // FIXME: do not do tihs too slow
    const session = await context.queryClient.ensureQueryData(
      getSessionQueryOpts({ sessionId, context }),
    );
    const station = await context.queryClient.ensureQueryData(
      getStationQueryOpts({ stationId: session.stationId, context }),
    );
    const unit = await context.queryClient.ensureQueryData(
      getUnitQueryOpts({ unitId: session.unitId, context }),
    );
    return { session, station, unit };
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      getProjectQueryOpts({ projectId: context.station.projectId, context }),
    );
  },
});

function pickTernary<T>(ternary: boolean | null, a: T, b: T, c: T) {
  switch (ternary) {
    case true:
      return a;
    case false:
      return b;
    case null:
      return c;
  }
}

function Page() {
  const context = Route.useRouteContext();
  const { workspace, station, unit, session } = context;

  const { data: project } = useSuspenseQuery(
    getProjectQueryOpts({ projectId: station.projectId, context }),
  );

  const status = useMemo(
    () => computePassingStatus(session.measurements),
    [session],
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

      <div className="flex mb-4">
        <div className="flex-grow min-w-96">
          <PageHeader>
            <PageHeaderHeading>Test Session</PageHeaderHeading>
            <div className="flex flex-wrap h-8 item-center justify-center max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              <CpuIcon className="h-6 w-6 mr-2" />
              <p className="pb-3 mr-1"> Unit Under Test:</p>
              <Link
                className="underline hover:text-muted-foreground"
                from={WorkspaceIndexRoute.fullPath}
                to="unit/$unitId"
                params={{ unitId: unit.id }}
              >
                {unit.serialNumber}
              </Link>
            </div>
          </PageHeader>
        </div>

        <Card className=" w-fit p-4 mt-8 text-center">
          {session.aborted ? (
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-red-500">
              Aborted
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center gap-2 text-2xl font-bold",
                pickTernary(
                  status.passing,
                  "text-green-500",
                  "text-red-500",
                  "text-muted-foreground",
                ),
              )}
            >
              {pickTernary(status.passing, "Passing", "Failing", "Unevaluated")}
              {pickTernary(status.passing, <Check />, <X />, <></>)}
            </div>
          )}
          <div className="py-2" />
          <div className="text-sm text-muted-foreground">
            <span>{status.passCount} passed</span>,{" "}
            <span>{status.failCount} failed</span>,{" "}
            <span>{status.unevaluatedCount} unevaluated</span>
          </div>
        </Card>
      </div>
      <div className="py-2" />

      {/* <DataTable columns={columns} data={session.measurements} /> */}
      <SessionTable measurements={session.measurements} />
    </div>
  );
}
