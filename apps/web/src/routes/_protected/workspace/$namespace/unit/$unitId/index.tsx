import RevisionHistory from "@/components/unit/revision-history";
import SwapUnit from "@/components/unit/swap-unit";
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
import { UnitTreeVisualization } from "@/components/visualization/tree-visualization";
import { getPartQueryOpts } from "@/lib/queries/part";
import { getUnitRevisionsQueryOpts } from "@/lib/queries/unit";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Session } from "@cloud/shared/src/schemas/public/Session";
import CenterLoadingSpinner from "@/components/center-loading-spinner";
import { getSessionsByUnitIdQueryOpts } from "@/lib/queries/session";

export const Route = createFileRoute(
  "/_protected/workspace/$namespace/unit/$unitId/",
)({
  component: UnitPage,
  loader: ({ context, params: { unitId } }) => {
    context.queryClient.ensureQueryData(
      getUnitRevisionsQueryOpts({ unitId, context }),
    );
    context.queryClient.ensureQueryData(
      getSessionsByUnitIdQueryOpts({ unitId, context }),
    );
    context.queryClient.ensureQueryData(
      getPartQueryOpts({ partId: context.partVariation.partId, context }),
    );
  },
  pendingComponent: CenterLoadingSpinner,
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
    cell: ({ row }) => {
      if (row.original.status === true) {
        return <Badge variant="green">Pass</Badge>;
      } else if (row.original.status === false) {
        return <Badge variant="red">Fail</Badge>;
      } else {
        return <Badge variant={"gray"}>Unevaluated</Badge>;
      }
    },
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
];

function UnitPage() {
  const context = Route.useRouteContext();
  const { unitId } = Route.useParams();
  const { workspace, unit, partVariation } = context;
  const { data: revisions } = useSuspenseQuery(
    getUnitRevisionsQueryOpts({ unitId, context }),
  );
  const { data: sessions } = useSuspenseQuery(
    getSessionsByUnitIdQueryOpts({ unitId, context }),
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
              <Link
                from={"/workspace/$namespace/unit/$unitId"}
                to="/workspace/$namespace"
              >
                {workspace.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={"/workspace/$namespace/unit/$unitId"}
                to="/workspace/$namespace/part"
              >
                Inventory
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link
                from={"/workspace/$namespace/unit/$unitId"}
                to="/workspace/$namespace/part/$partId/"
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
                from={"/workspace/$namespace/unit/$unitId"}
                to="/workspace/$namespace/variation/$partVariationId/"
                params={{ partVariationId: partVariation.id }}
              >
                {partVariation.partNumber}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{unit.serialNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader>
        <PageHeaderHeading className="">
          <div className="flex items-center gap-x-2">
            <div>{unit.serialNumber}</div>
            {unit.components.length > 0 && (
              <>
                <SwapUnit unit={unit} workspace={workspace} />
                <RevisionHistory revisions={revisions} />
              </>
            )}
          </div>
        </PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on &quot;{unit.serialNumber}
          &quot; are listed here.
        </PageHeaderDescription>
      </PageHeader>
      <div className="py-2" />
      {unit.parent && (
        <div>
          <span className="font-medium text-muted-foreground">In use: </span>
          <Link
            from={"/workspace/$namespace/unit/$unitId"}
            to={"/workspace/$namespace/unit/$unitId"}
            params={{
              unitId: unit.parent.id,
            }}
          >
            {unit.parent.serialNumber}
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
                    from: "/workspace/$namespace/unit/$unitId",
                    to: "/workspace/$namespace/session/$sessionId",
                    params: { sessionId: row.id },
                  })
                }
              />
            )}
          </ScrollArea>
        </div>
        <div className="w-2/5 h-[380px] border rounded-lg">
          <UnitTreeVisualization
            tree={unit}
            onNodeClick={(node) => {
              router.navigate({
                from: "/workspace/$namespace/unit/$unitId",
                to: "/workspace/$namespace/unit/$unitId/",
                params: { unitId: node.data.unit.id },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
