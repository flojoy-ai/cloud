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
import { getFamilyQueryOpts } from "@/lib/queries/family";
import {
  getHardwareQueryOpts,
  getHardwareRevisionsQueryOpts,
} from "@/lib/queries/hardware";
import { getModelQueryOpts } from "@/lib/queries/model";
import { getSessionsOpts } from "@/lib/queries/session";
import { Session } from "@cloud/server/src/types/session";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { Route as WorkspaceIndexRoute } from "@/routes/_protected/workspace/$namespace";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/hardware/$hardwareId/",
)({
  component: HardwarePage,
  beforeLoad: async ({ context, params: { hardwareId } }) => {
    const hardware = await context.queryClient.ensureQueryData(
      getHardwareQueryOpts({ hardwareId, context }),
    );
    const model = await context.queryClient.ensureQueryData(
      getModelQueryOpts({ modelId: hardware.modelId, context }),
    );
    return { hardware, model };
  },
  loader: async ({ context, params: { hardwareId } }) => {
    context.queryClient.ensureQueryData(
      getHardwareRevisionsQueryOpts({ hardwareId, context }),
    );
    context.queryClient.ensureQueryData(
      getSessionsOpts({ hardwareId, context }),
    );
    context.queryClient.ensureQueryData(
      getFamilyQueryOpts({ familyId: context.model.familyId, context }),
    );
  },
});

const columns: ColumnDef<Session>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "userId",
    header: "User",
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
];

function HardwarePage() {
  const context = Route.useRouteContext();
  const { workspace, hardware, model } = context;
  const { data: revisions } = useSuspenseQuery(
    getHardwareRevisionsQueryOpts({ hardwareId: hardware.id, context }),
  );
  const { data: sessions } = useSuspenseQuery(
    getSessionsOpts({ hardwareId: hardware.id, context }),
  );
  const { data: family } = useSuspenseQuery(
    getFamilyQueryOpts({ familyId: model.familyId, context }),
  );

  return (
    <div className="container max-w-screen-2xl">
      <div className="py-2"></div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.to} to="/">
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link from={WorkspaceIndexRoute.fullPath} to="family">
                Hardware Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="family/$familyId"
                params={{ familyId: family.id }}
              >
                {family.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={WorkspaceIndexRoute.fullPath}
                to="model/$modelId"
                params={{ modelId: model.id }}
              >
                {model.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{hardware.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">
          <div className="flex items-center gap-x-2">
            <div>{hardware.name}</div>
            {hardware.components.length > 0 && (
              <>
                <SwapHardware hardware={hardware} workspace={workspace} />
                <RevisionHistory revisions={revisions} />
              </>
            )}
          </div>
        </PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on &quot;{hardware.name}&quot; are
          listed here.
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
            {hardware.parent.name}
          </Link>
        </div>
      )}
      <div className="py-4" />
      <div className="flex gap-x-8">
        <div className="w-3/5">
          <ScrollArea className="h-[380px]">
            <DataTable columns={columns} data={sessions} />
          </ScrollArea>
        </div>
        <div className="w-2/5 h-[380px] border rounded-lg">
          <HardwareTreeVisualization tree={hardware} />
        </div>
      </div>
    </div>
  );
}
