import RevisionHistory from "@/components/hardware/revision-history";
import SwapHardware from "@/components/hardware/swap-hardware";
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
import { DataTable } from "@/components/ui/data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HardwareTreeVisualization } from "@/components/visualization/tree-visualization";
import { getPartQueryOpts } from "@/lib/queries/part";
import {
  getHardwareQueryOpts,
  getHardwareRevisionsQueryOpts,
} from "@/lib/queries/hardware";
import { getPartVariationQueryOpts } from "@/lib/queries/part-variation";
import { getSessionsQueryOpts } from "@/lib/queries/session";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";
import { useRouter } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Session } from "@cloud/shared/src/schemas/public/Session";
import CenterLoadingSpinner from "@/components/center-loading-spinner";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$hardwareId/",
)({
  component: HardwarePage,

  pendingComponent: CenterLoadingSpinner,
  beforeLoad: async ({ context, params: { hardwareId } }) => {
    const hardware = await context.queryClient.ensureQueryData(
      getHardwareQueryOpts({ hardwareId, context }),
    );
    const partVariation = await context.queryClient.ensureQueryData(
      getPartVariationQueryOpts({
        partVariationId: hardware.partVariationId,
        context,
      }),
    );
    return { hardware, partVariation };
  },
  loader: async ({ context, params: { hardwareId } }) => {
    context.queryClient.ensureQueryData(
      getHardwareRevisionsQueryOpts({ hardwareId, context }),
    );
    context.queryClient.ensureQueryData(
      getSessionsQueryOpts({ hardwareId, context }),
    );
    context.queryClient.ensureQueryData(
      getPartQueryOpts({ partId: context.partVariation.partId, context }),
    );
  },
});

const columns: ColumnDef<Session & { status: boolean | null }>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "userId",
    header: "User",
  },
  {
    header: "Status",
    accessorKey: "pass",
    cell: ({ row }) => {
      if (row.original.status === true)
        return (
          <Badge variant={null} className="bg-green-300 text-green-900">
            Pass
          </Badge>
        );
      else if (row.original.status === false)
        return (
          <Badge variant={null} className="bg-red-300 text-red-900">
            Fail
          </Badge>
        );
      else
        return (
          <Badge variant={null} className="bg-gray-300 text-gray-600">
            Unevaluated
          </Badge>
        );
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
];

function HardwarePage() {
  const context = Route.useRouteContext();
  const { workspace, hardware, partVariation } = context;
  const { data: revisions } = useSuspenseQuery(
    getHardwareRevisionsQueryOpts({ hardwareId: hardware.id, context }),
  );
  const { data: sessions } = useSuspenseQuery(
    getSessionsQueryOpts({ hardwareId: hardware.id, context }),
  );
  const { data: part } = useSuspenseQuery(
    getPartQueryOpts({ partId: partVariation.partId, context }),
  );
  const router = useRouter();

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.to} to=".">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.fullPath} to="part">
                Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="part/$partId"
                params={{ partId: part.id }}
              >
                {part.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="variation/$partVariationId"
                params={{ partVariationId: partVariation.id }}
              >
                {partVariation.partNumber}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{hardware.serialNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">
          <div className="flex items-center gap-x-2">
            <div>{hardware.serialNumber}</div>
            {hardware.components.length > 0 && (
              <>
                <SwapHardware hardware={hardware} workspace={workspace} />
                <RevisionHistory revisions={revisions} />
              </>
            )}
          </div>
        </PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on &quot;{hardware.serialNumber}
          &quot; are listed here.
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-2" />
      {hardware.parent && (
        <div>
          <span className="font-medium text-muted-foreground">In use: </span>
          <Link
            from={WorkspaceIndexRoute.fullPath}
            to="hardware/$hardwareId"
            params={{
              hardwareId: hardware.parent.id,
            }}
          >
            {hardware.parent.serialNumber}
          </Link>
        </div>
      )}
      <div className="py-4" />
      <div className="flex gap-x-8">
        <div className="w-3/5">
          <ScrollArea className="h-[380px]">
            {sessions.length === 0 ? (
              <div className="text-muted-foreground">
                No test sessions found, go upload one using the test sequencer
                in Flojoy Studio!
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={sessions}
                onRowClick={(row) =>
                  router.navigate({
                    from: WorkspaceIndexRoute.fullPath,
                    to: "session/$sessionId",
                    params: { sessionId: row.id },
                  })
                }
              />
            )}
          </ScrollArea>
        </div>
        <div className="w-2/5 h-[380px] border rounded-lg">
          <HardwareTreeVisualization tree={hardware} />
        </div>
      </div>
    </div>
  );
}
